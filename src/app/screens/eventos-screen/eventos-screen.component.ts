import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];

  // Para la tabla
  displayedColumns: string[] = ['nombre_evento','tipo_evento','fecha_realizacion','horario','lugar','responsable','editar','eliminar'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    private facadeService: FacadeService,
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Validar login
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    this.obtenerEventos();
  }

  public isAdmin(): boolean {
    return this.rol === 'administrador';
  }

  // Obtener lista de eventos
  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        console.log("Eventos: ", this.lista_eventos);

        if(this.lista_eventos.length > 0){
          this.dataSource.data = this.lista_eventos;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          //Filtrar solo por nombre
          this.dataSource.filterPredicate = (data: any, filter: string) => {
            return data.nombre_evento.trim().toLowerCase().includes(filter);
          };
        }
      }, (error) => {
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }
  // Filtro de búsqueda
  public aplicarFiltro(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  public goEditar(idEvento: number) {
    this.router.navigate(["registro-eventos-academicos/" + idEvento]);
  }

  public delete(idEvento: number) {
    // Solo administrador puede eliminar
    if (this.isAdmin()) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idEvento, rol: 'evento' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          alert("Evento eliminado correctamente.");
          // Recarga la lista
          this.obtenerEventos();
        } else {
          console.log("No se eliminó el evento");
        }
      });
    } else {
      alert("Solo los administradores pueden eliminar eventos.");
    }
  }
}
