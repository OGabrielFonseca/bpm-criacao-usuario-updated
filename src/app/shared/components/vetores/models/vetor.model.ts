import { FormControl, FormGroup } from '@angular/forms';
import { EmpresaModel } from '../../../../services/empresas/model/empresas.model';
import { FilialModel } from '../../../../services/filiais/model/filiais.model';

export type VetorFormModel = FormGroup<{
  empresaVetor: FormControl<EmpresaModel | null>;
  filialVetor: FormControl<FilialModel | null>;
}>;

export class VetorModel {
  constructor(filial: FilialModel, empresa: EmpresaModel) {
    this.filialVetor = filial;
    this.empresaVetor = empresa;
  }

  empresaVetor!: EmpresaModel | null;
  filialVetor!: FilialModel | null;
}
