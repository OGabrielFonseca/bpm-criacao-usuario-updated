import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UnidadesOrganizacionaisModel } from './unidade.model';
import { environment } from '../../../environments/environment.development';
import { RetornoPlugin } from '../../shared/models/retorno-plugin.model';
@Injectable({
  providedIn: 'root',
})
export class UnidadesService {
  private pluginUrl = environment.pluginUrl;
  private pluginServer = environment.pluginServer;
  private pluginId = environment.pluginId;

  constructor(private http: HttpClient) {}

  retornaUnidades(pesquisa: string, skip = 0): Observable<RetornoPlugin<UnidadesOrganizacionaisModel>> {
    return this.http.post<RetornoPlugin<UnidadesOrganizacionaisModel>>(this.pluginUrl, {
      inputData: {
        server: this.pluginServer,
        module: 'sapiens',
        service: 'bpmOu',
        port: 'getOu',
        skip: skip,
        desuni: pesquisa,
        encryption: '3',
      },
      id: this.pluginId,
    });
  }
}
