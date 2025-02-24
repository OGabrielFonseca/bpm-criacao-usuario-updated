import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { FiliaisModel } from './model/filiais.model';
import { environment } from '../../../environments/environment';
import { RetornoPlugin } from '../../shared/models/retorno-plugin.model';
import { WorkflowService } from '../../core/workflow/workflow.service';

@Injectable({
  providedIn: 'root',
})
export class FiliaisService {
  private pluginUrl = environment.pluginUrl;
  private pluginServer = environment.pluginServer;
  private pluginId = environment.pluginId;

  constructor(
    private http: HttpClient,
    private workflowService: WorkflowService,
  ) {}

  buscarFiliais(empresa: string, usuario = '', indicativoAbrangencia = 'S'): Observable<RetornoPlugin<FiliaisModel>> {
    return this.http
      .post<RetornoPlugin<FiliaisModel>>(this.pluginUrl, {
        inputData: {
          server: this.pluginServer,
          module: 'sapiens',
          service: 'bpmFilialUsuario',
          port: 'getFiliais',
          nomusu: usuario ? usuario : this.buscarUsuarioSolicitante(),
          indabr: indicativoAbrangencia,
          top: 1000,
          codemp: empresa ? empresa : null,
        },
        id: this.pluginId,
      })
      .pipe(retry(2));
  }

  buscarUsuarioSolicitante() {
    return this.workflowService.getUser().username;
  }
}
