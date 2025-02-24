import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { EmpresasModel } from './model/empresas.model';
import { RetornoPlugin } from '../../shared/models/retorno-plugin.model';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpresasService {
  private pluginUrl = environment.pluginUrl;
  private pluginServer = environment.pluginServer;
  private pluginId = environment.pluginId;

  constructor(
    private http: HttpClient,
    private workflowService: WorkflowService,
  ) {}

  buscarEmpresas(): Observable<RetornoPlugin<EmpresasModel>> {
    return this.http
      .post<RetornoPlugin<EmpresasModel>>(this.pluginUrl, {
        inputData: {
          server: this.pluginServer,
          module: 'sapiens',
          service: 'bpmEmpresaUsuario',
          port: 'getEmpresas',
          nomusu: this.workflowService.getUser().username,
          encryption: '3',
          top: 1000,
        },
        id: this.pluginId,
      })
      .pipe(retry(2));
  }
}
