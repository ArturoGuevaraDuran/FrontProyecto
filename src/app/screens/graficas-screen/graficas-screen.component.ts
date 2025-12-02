import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventosService } from 'src/app/services/eventos.service';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  //Variables
  public total_user: any = {};

  //Gráfica de barras para los eventos académicos
  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5'
        ]
      }
    ]
  }
  barChartOption: ChartConfiguration['options'] = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular para usuarios
  pieChartData: ChartConfiguration['data'] = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption: ChartConfiguration['options'] = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService,
    private eventosService: EventosService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerTotalEventos();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Actualizar Gráfica de Pastel
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [
            {
              data: [
                response.admins,
                response.maestros,
                response.alumnos
              ],
              backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
            }
          ]
        };

      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

  // Función para obtener el total de eventos
  public obtenerTotalEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        // Los agrupa por tipo de evento
        const conteoPorTipo: { [key: string]: number } = {};

        response.forEach((evento: any) => {
          const tipo = evento.tipo_evento;
          if (conteoPorTipo[tipo]) {
            conteoPorTipo[tipo]++;
          } else {
            conteoPorTipo[tipo] = 1;
          }
        });

        const labels = Object.keys(conteoPorTipo);
        const data = Object.values(conteoPorTipo);

        console.log("Datos de eventos para gráfica:", { labels, data });

        // Actualiza la gráfica de barras
        this.barChartData = {
          labels: labels,
          datasets: [
            {
              data: data,
              label: 'Eventos Académicos',
              backgroundColor: [
                '#F88406',
                '#FCFF44',
                '#82D3FB',
                '#FB82F5'
              ]
            }
          ]
        };
      },
      (error) => {
        console.error("Error al obtener eventos para gráfica", error);
      }
    );
  }
}
