import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { RetornoPlugin } from '../../shared/models/retorno-plugin.model';
import { SolicitanteModel } from './model/solicitante.model';

@Injectable({
  providedIn: 'root',
})
export class SolicitanteService {
  private pluginUrl = environment.pluginUrl;
  private pluginServer = environment.pluginServer;
  private pluginId = environment.pluginId;

  constructor(
    private http: HttpClient,
    private workFlowService: WorkflowService,
  ) {}

  buscarDadosSolicitantes(): Observable<RetornoPlugin<SolicitanteModel>> {
    return this.http
      .post<RetornoPlugin<SolicitanteModel>>(this.pluginUrl, {
        inputData: {
          server: this.pluginServer,
          module: 'rubi',
          service: 'informacoesUsuario',
          port: 'Consulta',
          nomusu: this.workFlowService.getUser().username,
          encryption: '3',
        },
        id: this.pluginId,
      })
      .pipe(retry(1));
  }
}
