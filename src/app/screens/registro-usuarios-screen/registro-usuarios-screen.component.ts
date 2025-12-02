import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from '../../services/administradores.service';
import { MaestrosService } from '../../services/maestros.service';
import { AlumnosService } from '../../services/alumnos.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo:string = "registro-usuarios";
  public user:any = {};
  public editar:boolean = false;
  public rol:string = "";
  public idUser:number = 0;

  //Banderas para el tipo de usuario
  public isAdmin:boolean = false;
  public isAlumno:boolean = false;
  public isMaestro:boolean = false;

  public tipo_user:string = "";
  public seleccionUsuario: boolean = false; //Deshabilita el radio button si viene por una URL

  constructor(
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private AdministradoresService: AdministradoresService,
    private MaestrosService: MaestrosService,
    private AlumnosService: AlumnosService
  ) { }

  ngOnInit(): void {
    this.user = { tipo_usuario: '' };

    // Detecta si hay un rol en la URL
    if (this.activatedRoute.snapshot.params['rol'] != undefined) {
      this.rol = this.activatedRoute.snapshot.params['rol'];
      this.user.tipo_usuario = this.rol;

      // para activar el formulario
      this.configurarRol(this.rol);

      // Bloquea los radio buttons
      this.seleccionUsuario = true;
    } else {
      // Si no hay rol en la URL
      this.seleccionUsuario = false;
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = false;
    }

    // Detecta si es edición, o sea tiene un ID en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User a editar: ", this.idUser);
      this.obtenerUserByID();
      this.isAdmin = false;
      this.isAlumno = false;
      this.isMaestro = false;
      // Al editar, siempr bloqueam el cambio de rol
      this.seleccionUsuario = true;
    }
  }

  //Función para configurar las banderas según el rol
  public configurarRol(rol: string){
    // Reinicia las banderas
    this.isAdmin = false;
    this.isAlumno = false;
    this.isMaestro = false;

    if(rol == "administrador"){
      this.isAdmin = true;
      this.tipo_user = "administrador";
    }else if (rol == "alumno"){
      this.isAlumno = true;
      this.tipo_user = "alumno";
    }else if (rol == "maestro"){
      this.isMaestro = true;
      this.tipo_user = "maestro";
    }
  }

  public radioChange(event: MatRadioChange) {
    this.configurarRol(event.value);
  }

    //Obtener usuario por ID
  public obtenerUserByID() {
    //Lógica para obtener el usuario según su ID y rol
    console.log("Obteniendo usuario de tipo: ", this.rol, " con ID: ", this.idUser);
    //llamada al servicio correspondiente según el rol
    if(this.rol == "administrador"){
      this.AdministradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
      );
    }else if(this.rol == "maestros"){
      this.MaestrosService.obtenerMaestroPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isMaestro = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el maestro seleccionado");
        }
      );

    }else if(this.rol == "alumno"){
      this.AlumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAlumno = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el alumno seleccionado");
        }
      );
    }

  }
  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
