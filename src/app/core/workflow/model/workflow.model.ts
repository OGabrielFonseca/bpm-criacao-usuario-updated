export interface WfVariable {
  /**
   * Values: String, Integer, Double, Float, ?.
   */
  type: string;

  /**
   * O nome da variável no fluxo.
   */
  key: string;

  /**
   * O valor atual da variável no fluxo.
   */
  value: string;
}

export interface WfUserData {
  id: string;
  username: string;
  subject: string;
  email: string;
  fullname: string;
  locale: string;
  tenantName: string;
  tenantLocale: string;
}

export interface WfPlatformDataToken {
  token_type: string;
  access_token: string;
}

export interface WfTaskData {
  taskName: string;
  processName: string;
}

export interface WfPlatformData {
  odataUrl: string;
  serviceUrl: string;
  token?: WfPlatformDataToken;
}

export interface WorkflowCockpit {
  isRequestNew: () => boolean;

  getUserData: () => Promise<WfUserData>;

  getTaskData: () => Promise<WfTaskData>;

  getPlatformData: () => Promise<WfPlatformData>;

  getInfoFromProcessVariables: () => Promise<WfVariable[]>;
}

export interface WfProcessResponsible {
  userCode: number;
  name: string;
  subjectKind: string;
}

export interface WfProcessAction {
  name: string;
  finish: boolean;
  connectsWithAutomaticGateway: boolean;
}

export interface WfProcess {
  processInstanceId: number;
}

export interface WfProcessStep extends WfProcess {
  nextAction: WfProcessAction;
  nextResponsible: WfProcessResponsible;
}

export interface WfProcessError extends WfProcess {
  error: Record<string, unknown>;
}

export interface WfFormData {
  formData?: Record<string, unknown>;
}

export interface WorkflowCockpitConnector {
  init?: (process: WfProcess, workflow: WorkflowCockpit) => void;

  onSubmit?: (proccessStep: WfProcessStep, workflow: WorkflowCockpit) => WfFormData;

  onError?: (processError: WfProcessError, workflow: WorkflowCockpit) => void;
}

export class WfUser implements WfUserData {
  id!: string;
  username!: string;
  subject!: string;
  email!: string;
  fullname!: string;
  locale!: string;
  tenantName!: string;
  tenantLocale!: string;
  token!: string;
}
