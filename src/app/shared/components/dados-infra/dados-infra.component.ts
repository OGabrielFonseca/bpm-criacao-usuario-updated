import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { UnidadeOrganizacionalModel } from '../../../services/unidades/unidade.model';
import { UnidadesService } from '../../../services/unidades/unidades.service';
import { Etapa } from '../../enums/etapa.enum';
import { mapArray } from '../../utils/array.utils';
import { DadosInfraFormModel } from './models/dados-infra-form.model';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

const IMPORTS = [ReactiveFormsModule, NzFormModule, NzInputModule, NzGridModule, NzSelectModule, NzCheckboxModule];

@Component({
  selector: 'app-dados-infra',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './dados-infra.component.html',
  styleUrls: ['./dados-infra.component.css'],
})
export class DadosInfraComponent implements OnInit {
  @Input()
  etapaAtual!: Etapa;

  get criarAtualizarAD() {
    return this.formGroup.controls.criarAtualizarAD.value;
  }

  formGroup!: DadosInfraFormModel;

  listaUnidades: UnidadeOrganizacionalModel[] = [];
  inscricaoUnidades!: Subscription;
  skipUnidades = 0;
  pesquisaUnidades = '';
  buscandoUnidades = false;

  constructor(
    private formBuider: FormBuilder,
    private unidadesService: UnidadesService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.moldaFormGroup();
  }

  moldaFormGroup() {
    const formGroup = this.formBuider.group({
      criarAtualizarAD: [{ value: false, disabled: this.etapaAtual != Etapa.VALIDACAO_INFRA }],
      realizouTreinamento: [{ value: false, disabled: this.etapaAtual != Etapa.VALIDACAO_SUPORTE }],
      loginUsuario: [{ value: null, disabled: true }],
      unidadeOrganizacional: [{ value: null, disabled: true }],
      chaveUnidadeOrganizacional: [{ value: null, disabled: true }],
    }) as DadosInfraFormModel;

    this.aoSelecionarUnidade(formGroup);
    this.aoSelecionarCriarAtualizarAD(formGroup);

    return formGroup;
  }

  aoSelecionarUnidade(formGroup: DadosInfraFormModel) {
    formGroup.controls.unidadeOrganizacional.valueChanges.subscribe((unidade: UnidadeOrganizacionalModel | null) => {
      if (!unidade) {
        formGroup.controls.chaveUnidadeOrganizacional.setValue(null);
        return;
      }

      formGroup.controls.chaveUnidadeOrganizacional.setValue(unidade.chvuni);
    });
  }

  aoSelecionarCriarAtualizarAD(formGroup: DadosInfraFormModel) {
    formGroup.controls.criarAtualizarAD.valueChanges.subscribe((criarAtualizarAD: boolean) => {
      if (this.etapaAtual == Etapa.VALIDACAO_INFRA) {
        if (criarAtualizarAD) {
          this.formGroup.controls.realizouTreinamento.enable();
          this.formGroup.controls.loginUsuario.enable();
          this.formGroup.controls.unidadeOrganizacional.enable();
          this.formGroup.controls.loginUsuario.setValidators([Validators.required, this.loginValido]);
          this.formGroup.controls.unidadeOrganizacional.setValidators([Validators.required]);
          this.formGroup.controls.chaveUnidadeOrganizacional.setValidators([Validators.required]);
        } else {
          this.formGroup.controls.realizouTreinamento.disable();
          this.formGroup.controls.loginUsuario.disable();
          this.formGroup.controls.unidadeOrganizacional.disable();
          this.formGroup.controls.loginUsuario.clearValidators();
          this.formGroup.controls.unidadeOrganizacional.clearValidators();
          this.formGroup.controls.chaveUnidadeOrganizacional.clearValidators();
          this.formGroup.controls.loginUsuario.setValue(null);
          this.formGroup.controls.unidadeOrganizacional.setValue(null);
          this.formGroup.controls.chaveUnidadeOrganizacional.setValue(null);
        }
      }
    });
  }

  buscarUnidades() {
    if (this.inscricaoUnidades) {
      this.inscricaoUnidades.unsubscribe();
    }
    this.inscricaoUnidades = this.unidadesService.retornaUnidades(this.pesquisaUnidades, this.skipUnidades).subscribe({
      next: retorno => {
        this.buscandoUnidades = false;

        if (!retorno || retorno.outputData.responseCode !== 200) {
          this.notificationService.error('Erro', 'Ocorreu um erro ao buscar as unidades organizacionais');
          return;
        }

        const unidades = mapArray<UnidadeOrganizacionalModel>(retorno.outputData.ou);
        this.listaUnidades.push(...unidades);
      },
      error: () => {
        this.notificationService.error('Erro', 'Ocorreu um erro ao buscar as unidades organizacionais');
        this.buscandoUnidades = false;
      },
    });
  }

  pesquisarUnidades(pesquisa: string) {
    this.pesquisaUnidades = pesquisa;
    this.listaUnidades = [];
    this.skipUnidades = 0;
    this.buscandoUnidades = true;
    this.buscarUnidades();
  }

  adicionaMaisUnidades() {
    this.skipUnidades += 10;
    this.buscandoUnidades = true;
    this.buscarUnidades();
  }

  loginValido(control: AbstractControl) {
    if (!control || !control.parent || !control.parent) {
      return null;
    }
    const login = control.value ? (control.value as string) : '';

    return login.length > 20 ? { tamanho: true } : null;
  }

  estaValido() {
    if (this.etapaAtual == Etapa.VALIDACAO_SUPORTE && this.formGroup.controls.realizouTreinamento.value) return false;

    this.formGroup.controls.loginUsuario.markAsDirty();
    this.formGroup.controls.unidadeOrganizacional.markAsDirty();
    this.formGroup.controls.chaveUnidadeOrganizacional.markAsDirty();
    this.formGroup.controls.loginUsuario.updateValueAndValidity();
    this.formGroup.controls.unidadeOrganizacional.updateValueAndValidity();
    this.formGroup.controls.chaveUnidadeOrganizacional.updateValueAndValidity();

    return this.formGroup.valid;
  }
}
