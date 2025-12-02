import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;
  public maxDate: Date; // Para bloquear fechas futuras

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    //El primer if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista asignamos los datos del user
      this.alumno = this.datos_user;
    }else{
      // Va a registrar un nuevo alumno
      this.alumno = this.alumnosService.esquemaAlumno();
      this.alumno.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    this.maxDate = new Date();
    //Imprimir datos en consola
    console.log("Alumno: ", this.alumno);

  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Lógica para registrar un nuevo alumno
    if(this.alumno.password == this.alumno.confirmar_password){
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Alumno registrado exitosamente");
          console.log("Alumno registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["alumnos"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          let mensajeError = "Error al registrar alumno";
          if(error.error && error.error.detail){
            mensajeError += ": " + error.error.detail;
          }
          alert("Error al registrar alumno");
          console.error("Error al registrar alumno: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizar(){
    //Validación de los datos
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    //Ejecutar el servicio de actualización
    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Alumno actualizado exitosamente");
        console.log("Alumno actualizado: ", response);
        this.router.navigate(["alumnos"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al actualizar alumno");
        console.error("Error al actualizar alumno: ", error);
      }
    );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
      // Almacena la fecha formato YYYY-MM-DD
      this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];

      // Llama a la función para calcular la edad
      this.calcularEdad(event.value);

    }

    //Función para calcular la edad
  private calcularEdad(fechaNac: Date) {
    const hoy = new Date();
    const fechanacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - fechanacimiento.getFullYear();
    const diferenciames = hoy.getMonth() - fechanacimiento.getMonth();

    // Comprueba si el cumpleaños de este año ya pasó
    if (diferenciames < 0 || (diferenciames === 0 && hoy.getDate() < fechanacimiento.getDate())) {
      edad--;
    }

    // Asigna la edad como string
    this.alumno.edad = edad.toString();
  }

  public soloLetras(event: KeyboardEvent) {
      const charCode = event.key.charCodeAt(0);

      if (charCode >= 65 && charCode <= 90) { return true; } // A-Z
      if (charCode >= 97 && charCode <= 122) { return true; } // a-z
      if (charCode === 32) { return true; } // Espacio

      // Acentos y Ñ
      if (charCode === 193 || charCode === 201 || charCode === 205 || charCode === 211 || charCode === 218 || charCode === 220 || charCode === 209) {
        return true;
      }
      // Acentos y ñ
      if (charCode === 225 || charCode === 233 || charCode === 237 || charCode === 243 || charCode === 250 || charCode === 252 || charCode === 241) {
        return true;
      }

      event.preventDefault();
      return false;
    }

  public soloAlfanumerico(event: KeyboardEvent) {
      const charCode = event.key.charCodeAt(0);

      if (charCode >= 65 && charCode <= 90) { return true; } // A-Z
      if (charCode >= 97 && charCode <= 122) { return true; } // a-z
      if (charCode >= 48 && charCode <= 57) { return true; } // 0-9

      event.preventDefault();
      return false;
    }

}
