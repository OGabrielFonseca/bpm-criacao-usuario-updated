import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MigrarAutenticacaoService {
  private baseUrl =
    'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/user/signals/listUsersAlterTypeAuthentication';

  constructor(private http: HttpClient) {}

  migrarAutenticacao(usuario: string): Observable<object> {
    return this.http.post(this.baseUrl, {
      currentAuthenticationType: 'G5',
      newAuthenticationType: 'LDAP',
      users: [usuario],
    });
  }
}
