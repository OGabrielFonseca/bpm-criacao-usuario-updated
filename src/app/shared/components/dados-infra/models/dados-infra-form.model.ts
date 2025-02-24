import { FormControl, FormGroup } from '@angular/forms';
import { UnidadeOrganizacionalModel } from '../../../../services/unidades/unidade.model';

export type DadosInfraFormModel = FormGroup<{
  criarAtualizarAD: FormControl<boolean>;
  realizouTreinamento: FormControl<boolean>;
  loginUsuario: FormControl<string | null>;
  unidadeOrganizacional: FormControl<UnidadeOrganizacionalModel | null>;
  chaveUnidadeOrganizacional: FormControl<string | null>;
}>;
