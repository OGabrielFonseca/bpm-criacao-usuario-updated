import { Injectable } from '@angular/core';
import workflowCockpit from '../../../workflow-cockpit';
import {
  WfFormData,
  WfPlatformData,
  WfProcess,
  WfProcessError,
  WfProcessStep,
  WfUser,
  WfVariable,
  WorkflowCockpit,
} from './model/workflow.model';

type ErrorFunction = (proccessStep: WfProcessError, workflow: WorkflowCockpit) => void;

type SubmitFunction = (proccessStep: WfProcessStep, workflow: WorkflowCockpit) => WfFormData | Promise<WfFormData>;

type ProccessVariables = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private static readonly EMPTY_PLATFORM_DATA: WfPlatformData = {
    odataUrl: '',
    serviceUrl: '',
    token: undefined,
  };

  private workflow: WorkflowCockpit;
  private errorFunction!: ErrorFunction;
  private submitFunction!: SubmitFunction;

  constructor() {
    this.workflow = workflowCockpit({
      init: (_: WfProcess, workflow: WorkflowCockpit) => {
        this.workflow = workflow;
      },
      onSubmit: (processStep: WfProcessStep, workflow: WorkflowCockpit) => {
        this.workflow = workflow;
        if (this.submitFunction) {
          return this.submitFunction(processStep, workflow);
        }
        return {};
      },
      onError: (processError: WfProcessError, workflow: WorkflowCockpit) => {
        this.workflow = workflow;
        if (this.errorFunction) {
          this.errorFunction(processError, workflow);
        }
      },
    }) as WorkflowCockpit;
  }

  public onError(fn: ErrorFunction): void {
    this.errorFunction = fn;
  }

  public onSubmit(fn: SubmitFunction): void {
    this.submitFunction = fn;
  }

  /**
   * @description aborta a ação de submit. Este método pode ser utilizado para cancelar a ação de subimit
   * caso o formulário seja inválido.
   */
  public abortSubmit(): void {
    throw new Error('Ação cancelada.');
  }

  public requestPlatformDataAndVariables(): Promise<WfPlatformData & ProccessVariables> {
    return Promise.all([this.requestPlatformData(), this.requestProcessVariables()]).then(results => {
      const allPromiseResults = results.reduce(
        (previousValue, currentValue) => Object.assign(previousValue, currentValue),
        {},
      );
      return allPromiseResults as WfPlatformData & ProccessVariables;
    });
  }

  public requestPlatformData(): Promise<WfPlatformData> {
    return this.workflow.getPlatformData().then(platform => platform || WorkflowService.EMPTY_PLATFORM_DATA);
  }

  public requestUserData(): Promise<WfUser> {
    return this.workflow.getUserData().then(data => {
      if (data) {
        const userData: WfUser = Object.assign(new WfUser(), data);

        if (userData.username.indexOf('@') >= 0) {
          userData.username = userData.username.split('@')[0];
        }

        return userData;
      } else {
        return new WfUser();
      }
    });
  }

  public requestProcessVariables(): Promise<ProccessVariables> {
    return this.workflow.getInfoFromProcessVariables().then(wfVariables => {
      if (wfVariables) {
        return this.parsePendencyData(wfVariables);
      } else {
        return {};
      }
    });
  }

  public getToken(bearer = true): string {
    const TOKEN = sessionStorage.getItem('senior-token') || '';
    return bearer ? `Bearer ${TOKEN}` : TOKEN;
  }

  public getUser(): WfUser {
    return JSON.parse(sessionStorage.getItem('user-data') || '') as WfUser;
  }

  private parsePendencyData(pendencyData: WfVariable[]): ProccessVariables {
    const data: Record<string, unknown> = {};
    for (const pendency of pendencyData) {
      const attr = pendency;
      if (attr.type === 'Integer' || attr.type === 'Double' || attr.type === 'Float') {
        data[attr.key] = parseFloat(attr.value);
      } else {
        data[attr.key] = attr.value;
      }
    }
    return data;
  }
}
