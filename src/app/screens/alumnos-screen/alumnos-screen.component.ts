import { Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit{

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];
  public IdUsuarioActual: number = 0;

  //Para la tabla
  displayedColumns: string[] = ['matricula','nombre','email','fecha_nacimiento','telefono','rfc','curp','edad','ocupacion','editar','eliminar'];
  dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.IdUsuarioActual = Number(this.facadeService.getUserId());
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener alumnos
    this.obtenerAlumnos();
  }

  // Consumimos el servicio para obtener los alumnos
  //Obtener alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            if(usuario.user){
              usuario.first_name = usuario.user.first_name;
              usuario.last_name = usuario.user.last_name;
              usuario.email = usuario.user.email;
            }
          });
          console.log("Alumnos: ", this.lista_alumnos);

          this.dataSource.data =new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]).data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          //Para ordenar por nombre completo
          this.dataSource.sortingDataAccessor = (item: DatosAlumno, property: string) => {
            if (property === 'nombre') {
              return `${item.first_name} ${item.last_name}`;
            } else {
              return item[property as keyof DatosAlumno];
            }
          };

          //Personalizar el filtro
          this.dataSource.filterPredicate = (data: DatosAlumno, filter: string) => {
            const searchStr = filter.toLowerCase();
            const nombreCompleto = `${data.first_name} ${data.last_name}`.toLowerCase();
            return nombreCompleto.includes(searchStr)
          };
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

    // Método para aplicar el filtro de búsqueda
  public aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
  }

 public delete(idUser: number){
    const userId = this.IdUsuarioActual;
    // Admin puede eliminar cualquier alumno
    // Maestro puede eliminar cualquier alumno
    // Alumno solo puede eliminar su propio registro
    if (this.rol === 'administrador' || this.rol === 'maestro' || (this.rol === 'alumno' && userId === idUser)) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumno'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente.");
          window.location.reload();
        }else{
          console.log("No se eliminó el alumno");
        }
      });
    } else {
      alert("No tienes permisos para eliminar este usuario.");
    }
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosAlumno {
  id: number,
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  curp: string,
  edad: number,
  ocupacion: string,
}
