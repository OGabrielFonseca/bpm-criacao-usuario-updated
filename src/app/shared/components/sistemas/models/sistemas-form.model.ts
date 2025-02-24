import { FormGroup, FormControl } from '@angular/forms';

export type SistemasFormModel = FormGroup<{
  sistemaEngeman: FormControl<boolean | null>;
  perfilEngeman: FormControl<string | null>;
  sistemaGatec: FormControl<boolean | null>;
  perfilGatec: FormControl<string | null>;
  sistemaMega: FormControl<boolean | null>;
  perfilMega: FormControl<string | null>;
  sistemaGestaoMineracao: FormControl<boolean | null>;
  perfilGestaoMineracao: FormControl<string | null>;
}>;
