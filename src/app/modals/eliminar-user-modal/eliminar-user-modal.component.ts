import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AdministradoresService } from "src/app/services/administradores.service";
import { AlumnosService } from "src/app/services/alumnos.service";
import { MaestrosService } from "src/app/services/maestros.service";
import { EventosService } from '../../services/eventos.service';


@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
      private AdministradoresService: AdministradoresService,
      private MaestrosService: MaestrosService,
      private AlumnosService: AlumnosService,
      private dialogRef: MatDialogRef<EliminarUserModalComponent>,
      private EventosService: EventosService,
      @Inject (MAT_DIALOG_DATA) public data: any

  ) { }
  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

    public eliminarUser(){
    if(this.rol == "administrador"){
      // Entonces elimina un administrador
      this.AdministradoresService.eliminarAdmin(this.data.id).subscribe(
        (response)=>{
          console.log(response);
          this.dialogRef.close({isDelete:true});
        }, (error)=>{
          this.dialogRef.close({isDelete:false});
        }
      );

    }else if(this.rol == "maestro"){
      // Entonces elimina un maestro
      this.MaestrosService.eliminarMaestro(this.data.id).subscribe(
        (response)=>{
          console.log(response);
          this.dialogRef.close({isDelete:true});
        }, (error)=>{
          this.dialogRef.close({isDelete:false});
        }
      );

    }else if(this.rol == "alumno"){
      // Entonces elimina un alumno
      this.AlumnosService.eliminarAlumno(this.data.id).subscribe(
        (response)=>{
          console.log(response);
          this.dialogRef.close({isDelete:true});
        }, (error)=>{
          this.dialogRef.close({isDelete:false});
        }
      );
    }
    else if(this.rol == "evento"){
      // Entonces elimina un evento
      this.EventosService.eliminarEvento(this.data.id).subscribe(
        (response)=>{
          console.log(response);
          this.dialogRef.close({isDelete:true});
        }, (error)=>{
          this.dialogRef.close({isDelete:false});
        }
      );
    }

  }

}
