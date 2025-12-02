import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user:string = "";
  public lista_admins:any[]= [];
  public rol:string = "";

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins(){
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response)=>{
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error)=>{
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idUser: number){
    this.router.navigate(["registro-usuarios/administrador/"+idUser]);
  }

  public delete(idUser: number){
    // Solo un administrador puede eliminar a otro administrador
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'administrador'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Administrador eliminado");
          alert("Administrador eliminado correctamente.");
          window.location.reload();
        }else{
          alert("Administrador no se ha podido eliminar.");
          console.log("No se eliminó el administrador");
        }
      });
    } else {
      alert("No tienes permisos para eliminar este usuario.");
    }
  }

}
