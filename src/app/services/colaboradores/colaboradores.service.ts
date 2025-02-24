import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RetornoPlugin } from '../../shared/models/retorno-plugin.model';
import { ColaboradoresModel } from './model/colaboradores.model';

@Injectable({
  providedIn: 'root',
})
export class ColaboradoresService {
  private pluginUrl = environment.pluginUrl;
  private pluginServer = environment.pluginServer;
  private pluginId = environment.pluginId;

  constructor(private http: HttpClient) {}

  buscarColaboradores(nomeFuncionario: string, skip: number): Observable<RetornoPlugin<ColaboradoresModel>> {
    return this.http
      .post<RetornoPlugin<ColaboradoresModel>>(this.pluginUrl, {
        inputData: {
          server: this.pluginServer,
          module: 'rubi',
          service: 'bpmColaboradores',
          port: 'getColaboradores',
          nomfun: nomeFuncionario,
          skip: skip,
          encryption: '3',
        },
        id: this.pluginId,
      })
      .pipe(retry(1));
  }
}
