import { MatPaginatorModule } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { EventosService } from 'src/app/services/eventos.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MaestrosService } from '../../services/maestros.service';
import { AdministradoresService } from '../../services/administradores.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  // Variables para el formulario
  public evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public minDate: Date; //solo fechas futuras
  // Para seleccionar los responsables de eventos
  public listaResponsables: any[] = [];
  public cargandoResponsables: boolean = false;

  public tiposDeEvento: string[] = [
    'Conferencia',
    'Taller',
    'Seminario',
    'Concurso'
  ];

  public publicosObjetivo: string[] = [
    'Estudiantes',
    'Profesores',
    'Público general'
  ];

  public programasEducativos: string[] = [
    'Ingeniería en Ciencias de la Computación',
    'Licenciatura en Ciencias de la Computación',
    'Ingeniería en Tecnologías de la Información'
  ];


  constructor(
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private MaestrosService: MaestrosService,
    private AdministradoresService: AdministradoresService,
    private facadeService: FacadeService,
    public dialog: MatDialog
  ) {
    // Solo permitir seleccionar fechas a partir de hoy
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.evento = this.eventosService.esquemaEvento();
    this.cargarResponsables();

    //El if valida si existe un parámetro ID en la URL
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.evento = this.activatedRoute.snapshot.params['id'];
      // Cargar datos del evento
      this.eventosService.obtenerEventoPorID(this.evento).subscribe(
        (response) => {
          this.evento = response;
          if(this.evento.fecha_realizacion){
            // para evitar problemas de zona horaria al crear el Date
            this.evento.fecha_realizacion = new Date(this.evento.fecha_realizacion + 'T00:00:00');
          }
        }, (error) => {
          alert("No se pudo obtener la información del evento");
        }
      );
    }
  }

  public cargarResponsables() {
    this.cargandoResponsables = true;
    this.listaResponsables = [];

    // Primera llamada a maestros
    this.MaestrosService.obtenerListaMaestros().subscribe(
      (responseMaestros: any[]) => {
        // Recorre la lista de maestros
        for (const maestro of responseMaestros) {
          const nombre = maestro.user.first_name + " " + maestro.user.last_name;
          this.listaResponsables.push({
            id: maestro.user.id,
            nombreCompleto: nombre
          });
        }

        // Segunda llamada a admins anidada
        this.AdministradoresService.obtenerListaAdmins().subscribe(
          (responseAdmins: any[]) => {
            for (const admin of responseAdmins) {
              const nombre = admin.user.first_name + " " + admin.user.last_name;
              this.listaResponsables.push({
                id: admin.user.id,
                nombreCompleto: nombre
              });
            }

            // Ordena la lista
            this.listaResponsables.sort((a, b) => {
              if (a.nombreCompleto < b.nombreCompleto) {
                return -1;
              }
              if (a.nombreCompleto > b.nombreCompleto) {
                return 1;
              }
              return 0;
            });

            this.cargandoResponsables = false;
          },
          (error) => {
            this.cargandoResponsables = false;
            this.errors.responsable_evento = "Error al cargar la lista de responsables";
          }
        );
      },
      (error) => {
        this.cargandoResponsables = false;
        this.errors.responsable_evento = "Error al cargar la lista de responsables";
      }
    );
  }

  // Función para el botón Cancelar
  public regresar() {
    this.location.back();
  }


  public registrar() {
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, false);

    if (Object.keys(this.errors).length > 0) {
      if (this.errors.hora_final === "La hora de inicio debe ser anterior a la hora final") {
        alert("La hora de finalización no puede ser anterior a la de inicio.");
        this.evento.hora_final = '';
      }

      return;
    }

    if (this.evento.fecha_realizacion instanceof Date) {
      this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
    }

    this.eventosService.RegistrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        this.router.navigate(["/eventos-academicos"]);
      }, (error) => {
        alert("Error al registrar evento");
        console.log(error);
      }
    );
  }

  public actualizar() {
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, true);

    if (Object.keys(this.errors).length > 0) {
      if (this.errors.hora_final === "La hora de inicio debe ser anterior a la hora final") {
        alert("La hora de finalización no puede ser anterior a la de inicio.");
        this.evento.hora_final = '';
      }
      return;
    }

    // Abre el modal de confirmación
    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
      height: '288px',
      width: '328px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isEdit) {
        // Si el usuario confirmó
        if (this.evento.fecha_realizacion instanceof Date) {
          this.evento.fecha_realizacion = this.evento.fecha_realizacion.toISOString().split('T')[0];
        }

        this.eventosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert("Evento actualizado correctamente");
            this.router.navigate(["/eventos-academicos"]);
          }, (error) => {
            alert("Error al actualizar evento");
            console.log(error);
          }
        );
      } else {
        console.log("Edición cancelada");
      }
    });
  }

  public checkboxChange(event: MatCheckboxChange) {
    const valor = event.source.value;
    if (event.checked) {
      if (!this.evento.publico_objetivo.includes(valor)) {
        this.evento.publico_objetivo.push(valor);
      }
    } else {
      const index = this.evento.publico_objetivo.indexOf(valor);
      if (index > -1) {
        this.evento.publico_objetivo.splice(index, 1);
      }
    }
    console.log("Público objetivo:", this.evento.publico_objetivo);
  }

  public revisarSeleccion(opcion: string): boolean {
    if (this.evento.publico_objetivo) {
      return this.evento.publico_objetivo.includes(opcion);
    }
    return false;
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

  //Permite solo letras y números, sin espacios
  public soloAlfanumerico(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);

    if (charCode >= 65 && charCode <= 90) { return true; } // A-Z
    if (charCode >= 97 && charCode <= 122) { return true; } // a-z
    if (charCode >= 48 && charCode <= 57) { return true; } // 0-9

    event.preventDefault();
    return false;
  }

  //Permite letras, números y espacios
  public soloAlfanumericoConEspacios(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);

    if (charCode >= 65 && charCode <= 90) { return true; } // A-Z
    if (charCode >= 97 && charCode <= 122) { return true; } // a-z
    if (charCode >= 48 && charCode <= 57) { return true; } // 0-9
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

  public soloAlfanumericoPuntuacion(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || [0, 8, 9, 13, 35, 36, 37, 39].includes(event.keyCode)) {
      return true;
    }
    const charCode = event.key.charCodeAt(0);
    if (charCode >= 65 && charCode <= 90) { return true; }
    if (charCode >= 97 && charCode <= 122) { return true; }
    if (charCode >= 48 && charCode <= 57) { return true; }
    if (charCode === 32) { return true; }
    if ([193, 201, 205, 211, 218, 220, 209].includes(charCode)) {
      return true;
    }
    if ([225, 233, 237, 243, 250, 252, 241].includes(charCode)) {
      return true;
    }
    if ([44, 46, 59].includes(charCode)) {
      return true;
    }
    event.preventDefault();
    return false;
  }

}
