import { Injectable } from '@angular/core';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable({
  providedIn: 'root',
  deps: [WorkflowService],
})
export class AppInitializerService {
  constructor(private workflowService: WorkflowService) {}

  async getCredentials(): Promise<void> {
    const plataFormData = await this.workflowService.requestPlatformData();
    sessionStorage.setItem('senior-token', plataFormData.token?.access_token || '');
    const userData = await this.workflowService.requestUserData();
    sessionStorage.setItem('user-data', JSON.stringify(userData));
  }
}

export function AppInitializerFactory(init: AppInitializerService) {
  return async (): Promise<void> => {
    return await init.getCredentials();
  };
}
