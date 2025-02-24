import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GruposModel } from './models/grupo.model';
import { RetornoPlugin } from '../../shared/models/retorno-plugin.model';

@Injectable({
  providedIn: 'root',
})
export class GruposService {
  private pluginUrl = environment.pluginUrl;
  private pluginServer = environment.pluginServer;
  private pluginId = environment.pluginId;

  constructor(private http: HttpClient) {}

  buscarGruposSistema(
    pesquisa: string,
    skip = 0,
    codemp: string,
    codfil: string,
    modulo: string,
  ): Observable<RetornoPlugin<GruposModel>> {
    return this.http.post<RetornoPlugin<GruposModel>>(this.pluginUrl, {
      inputData: {
        server: this.pluginServer,
        module: modulo,
        service: 'bpmGruposErp',
        port: 'getGrupos',
        skip: skip,
        pesquisa: pesquisa,
        codemp: codemp,
        codfil: codfil,
        encryption: '3',
      },
      id: this.pluginId,
    });
  }

  buscarGruposColaborador(
    nomeUsuario: string,
    codemp: string,
    codfil: string,
    modulo: string,
  ): Observable<RetornoPlugin<GruposModel>> {
    return this.http
      .post<RetornoPlugin<GruposModel>>(this.pluginUrl, {
        inputData: {
          server: this.pluginServer,
          service: 'bpmGruposDoUsuario',
          port: 'getGrupos',
          module: modulo,
          nomusu: nomeUsuario,
          codemp: codemp,
          codfil: codfil,
          skip: 0,
          encryption: '3',
          top: 1000,
        },
        id: this.pluginId,
      })
      .pipe(retry(2));
  }
}
