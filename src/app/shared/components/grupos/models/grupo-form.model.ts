import { FormControl, FormGroup } from '@angular/forms';
import { GrupoModel } from '../../../../services/grupos/models/grupo.model';

export type GrupoFormGroupModel = FormGroup<{
  grupo: FormControl<null | GrupoModel>;
  aprovador: FormControl<string | null>;
}>;

export interface GrupoFormModel {
  grupo: GrupoModel;
  aprovador: string;
}
