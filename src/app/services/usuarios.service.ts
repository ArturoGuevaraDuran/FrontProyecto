import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  /**
   * Devuelve la estructura base para un objeto de tipo usuario.
   */
  public esquemaUsuario(){
    return {
      'rol':'',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'rfc': '',
      'edad': '',
    }
  }

  /**
   * Valida los datos del formulario de registro o edición de un usuario.
   * @param data Objeto con los datos del usuario.
   * @param editar Booleano que indica si es un formulario de edición.
   * @returns Un objeto con los errores encontrados.
   */
  public validarUsuario(data: any, editar: boolean){
    console.log("Validando datos del usuario... ", data);
    let error: any = {};

    // --- Validaciones de campos ---

    if(!this.validatorService.required(data["first_name"])){
      error["first_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["last_name"])){
      error["last_name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    }else if(!this.validatorService.max(data["email"], 40)){
      error["email"] = this.errorService.max(40);
    }else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    // Las contraseñas solo se validan al crear un nuevo usuario
    if(!editar){
      if(!this.validatorService.required(data["password"])){
        error["password"] = this.errorService.required;
      } else if (data['password'] !== data['confirmar_password']) {
        // Validación para asegurar que las contraseñas coincidan
        error["confirmar_password"] = "Las contraseñas no coinciden.";
      }

      if(!this.validatorService.required(data["confirmar_password"])){
        error["confirmar_password"] = this.errorService.required;
      }
    }

    if(!this.validatorService.required(data["rfc"])){
      error["rfc"] = this.errorService.required;
    }else if(!this.validatorService.min(data["rfc"], 12)){
      error["rfc"] = this.errorService.min(12);
    }else if(!this.validatorService.max(data["rfc"], 13)){
      error["rfc"] = this.errorService.max(13);
    }

    if(!this.validatorService.required(data["edad"])){
      error["edad"] = this.errorService.required;
    }else if(!this.validatorService.numeric(data["edad"])){
      error["edad"] = "La edad debe ser un valor numérico.";
    }else if(data["edad"]<18){
      error["edad"] = "Debes ser mayor de 18 años para registrarte.";
    }

    if(!this.validatorService.required(data["telefono"])){
      error["telefono"] = this.errorService.required;
    }

    // Devuelve el objeto con los errores
    return error;
  }
}
