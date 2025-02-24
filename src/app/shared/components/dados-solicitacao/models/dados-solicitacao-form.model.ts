import { FormGroup, FormControl } from '@angular/forms';
import { ColaboradorModel } from '../../../../services/colaboradores/model/colaboradores.model';

export type DadosSolicitacaoFormGroupModel = FormGroup<{
  nomeColaborador: FormControl<ColaboradorModel | null>;
  matriculaColaborador: FormControl<string | null>;
  empresaColaborador: FormControl<string | null>;
  filialColaborador: FormControl<string | null>;
  tipoColaborador: FormControl<string | null>;
  localColaborador: FormControl<string | null>;
  cargoColaborador: FormControl<string | null>;
  usuarioColaborador: FormControl<string | null>;
  telefoneColaborador: FormControl<string | null>;
  ramalColaborador: FormControl<string | null>;
  informacoesAdicionais: FormControl<string | null>;
}>;
