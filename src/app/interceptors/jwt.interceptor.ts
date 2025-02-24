import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { WorkflowService } from '../core/workflow/workflow.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const workflowService = inject(WorkflowService);

  req = req.clone({
    setHeaders: {
      Authorization: workflowService.getToken(true),
      user: workflowService.getUser().username,
    },
  });

  return next(req);
};
