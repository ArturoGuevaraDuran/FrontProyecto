import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) { }

  public esquemaEvento() {
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_realizacion': null,
      'hora_inicio': '',
      'hora_final': '',
      'lugar': '',
      'publico_objetivo': [],
      'programa_educativo': '',
      'responsable_evento': '',
      'descripcion_breve': '',
      'cupo_maximo': null
    }
  }

  // Convierte hora a minutos
    private HoraMinutos(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return 0; // Formato inválido

    const [time, period] = parts;
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

  public validarEvento(data: any, editar: boolean = false) {
    console.log("Validando evento... ", data);
    let error: any = {};

    if (!this.validatorService.required(data["nombre_evento"])) {
      error["nombre_evento"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["tipo_evento"])) {
      error["tipo_evento"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["fecha_realizacion"])) {
      error["fecha_realizacion"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_final"])) {
      error["hora_final"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    }

    if (data["publico_objetivo"].length === 0) {
      error["publico_objetivo"] = "Debe seleccionar al menos un público objetivo";
    }

    // el programa educativo es obligatorio solo si es Estudiantes
    if (data["publico_objetivo"].includes('Estudiantes') && !this.validatorService.required(data["programa_educativo"])) {
      error["programa_educativo"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["responsable_evento"])) {
      error["responsable_evento"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["descripcion_breve"])) {
      error["descripcion_breve"] = this.errorService.required;
    } else if (!this.validatorService.max(data["descripcion_breve"], 300)) {
      error["descripcion_breve"] = this.errorService.max(300);
    }

    if (!this.validatorService.required(data["cupo_maximo"])) {
      error["cupo_maximo"] = this.errorService.required;
    }

    if (data["hora_inicio"] && data["hora_final"]) {
      const inicioMin = this.HoraMinutos(data["hora_inicio"]);
      const finMin = this.HoraMinutos(data["hora_final"]);

      // Compara los valores numéricos, o sea los minutos
      if (inicioMin >= finMin) {
        error["hora_final"] = "La hora de inicio debe ser anterior a la hora final";
      }
    }

    return error;
  }

//Servicios HTTP
//Servicio para registrar un nuevo evento
  public RegistrarEvento<T>(data: any): Observable<T> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<T>(`${environment.url_api}/eventos/`, data, { headers });
  }

//Servicio para obtener la lista de eventos
  public obtenerListaEventos(): Observable<any> {
      const token = this.facadeService.getSessionToken();
      let headers: HttpHeaders;
      if (token) {
        headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
      } else {
        headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      }
      return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
    }

//Servicio para obtener un evento por ID
  public obtenerEventoPorID(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${id}`, { headers });
  }

    // Actualizar Evento
  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  // Eliminar Evento
  public eliminarEvento(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${id}`, { headers });
  }

  // Servicio para obtener el total de eventos por tipo
  public getTotalEventosPorTipo(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/total-eventos/`, { headers });
  }

}
