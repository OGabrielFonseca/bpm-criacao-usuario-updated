import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';
import { DescricaoGrupoPipe } from '../../../pipes/descricao-grupo.pipe';
import { ColaboradorModel } from '../../../services/colaboradores/model/colaboradores.model';
import { GruposService } from '../../../services/grupos/grupos.service';
import { GrupoModel } from '../../../services/grupos/models/grupo.model';
import { Etapa } from '../../enums/etapa.enum';
import { mapArray } from '../../utils/array.utils';
import { GrupoFormGroupModel } from './models/grupo-form.model';

const IMPORTS = [
  ReactiveFormsModule,
  NzFormModule,
  NzGridModule,
  NzSelectModule,
  NzInputModule,
  NzTableModule,
  NzButtonModule,
  NzIconModule,
  DescricaoGrupoPipe,
];

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './grupos.component.html',
  styleUrl: './grupos.component.css',
})
export class GruposComponent implements OnInit {
  @Input()
  etapaAtual = Etapa.SOLICITACAO;

  @Output()
  enviaBuscandoGrupos = new EventEmitter<boolean>();

  @Output()
  enviaGruposColaborador = new EventEmitter<GrupoModel[]>();

  @Output()
  enviaPossuiGrupos = new EventEmitter<boolean>();

  @Input()
  set dadosColaborador(dadosColaborador: ColaboradorModel) {
    this.formArray.clear();

    if (!dadosColaborador || dadosColaborador.nomusu) return;

    this._dadosColaborador = dadosColaborador;
  }

  get dadosColaborador() {
    return this._dadosColaborador;
  }

  @Input()
  moduloGrupos!: string;

  formGroup = this.formBuilder.group({
    grupos: this.formBuilder.array([] as GrupoFormGroupModel[]),
  });

  Etapa = Etapa;

  private _dadosColaborador!: ColaboradorModel;

  listaGruposSistema: GrupoModel[] = [];
  listaGruposColaborador: GrupoModel[] = [];
  inscricaoGrupos!: Subscription;
  skipGrupos = 0;
  pesquisaGrupo = '';
  buscandoGrupos = false;

  get formArray() {
    return this.formGroup.controls.grupos;
  }

  constructor(
    private formBuilder: FormBuilder,
    private gruposService: GruposService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    if ([Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual)) {
      this.adicionarGrupo();
    }
  }

  moldaGrupoFormGroup(grupo?: GrupoModel) {
    const formGroup = this.formBuilder.group({
      grupo: [
        {
          value: grupo || null,
          disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual),
        },
        [Validators.required, this.grupoUnico()],
      ],
      aprovador: [{ value: grupo?.nomapr || null, disabled: true }],
    }) as GrupoFormGroupModel;

    this.aoSelecionarGrupo(formGroup);
    return formGroup;
  }

  aoSelecionarGrupo(formGroup: GrupoFormGroupModel) {
    formGroup.controls.grupo.valueChanges.subscribe(grupo => {
      if (!grupo) {
        formGroup.controls.aprovador.setValue('');
        return;
      }

      formGroup.controls.aprovador.setValue(grupo.nomapr ?? '');
    });
  }

  adicionarGrupo(grupo?: GrupoModel) {
    this.formArray.push(this.moldaGrupoFormGroup(grupo));
  }

  buscarGruposSistema() {
    if (this.inscricaoGrupos) {
      this.inscricaoGrupos.unsubscribe();
    }

    const empresa = this.dadosColaborador.empSap;
    const filial = this.dadosColaborador.filSap;

    this.buscandoGrupos = true;

    this.inscricaoGrupos = this.gruposService
      .buscarGruposSistema(this.pesquisaGrupo, this.skipGrupos, empresa, filial, this.moduloGrupos)
      .subscribe({
        next: retorno => {
          this.buscandoGrupos = false;

          if (retorno.outputData.responseCode !== 200) {
            this.notificationService.error('Erro', 'Erro ao buscar grupos do sistema');
            return;
          }

          const grupos = mapArray<GrupoModel>(retorno.outputData.grupos);
          this.listaGruposSistema.push(...grupos);
        },
        error: () => {
          this.buscandoGrupos = false;
          this.notificationService.error('Erro', 'Erro ao buscar grupos do sistema');
        },
      });
  }

  pesquisaGrupos(pesquisa: string) {
    this.pesquisaGrupo = pesquisa;
    this.listaGruposSistema = [];
    this.skipGrupos = 0;
    this.buscandoGrupos = true;
    this.buscarGruposSistema();
  }

  adicionaMaisGrupos() {
    this.buscandoGrupos = true;
    this.skipGrupos += 10;
    this.buscarGruposSistema();
  }

  preencherGrupos(grupos: GrupoModel[]) {
    grupos.forEach(grupo => {
      this.listaGruposSistema.push(grupo);
      this.adicionarGrupo(grupo);
    });
  }

  grupoUnico(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control || !control.parent) {
        return null;
      }

      const grupoControl = control.value as GrupoModel;
      const formGroup = control.parent as FormGroup;

      const grupoRepete = this.formArray.controls.some((group: AbstractControl) => {
        const grupo = group.get('grupo')?.value as GrupoModel;
        return grupo && grupoControl
          ? grupo.codgrp === grupoControl.codgrp && group !== formGroup
          : grupo === grupoControl && group !== formGroup;
      });

      return grupoRepete ? { repete: true } : null;
    };
  }

  compararGrupos(grupo1: GrupoModel, grupo2: GrupoModel) {
    return grupo1 && grupo2 ? grupo1.codgrp === grupo2.codgrp : grupo1 === grupo2;
  }

  estaValido() {
    this.formArray.controls.forEach(group => {
      const formGroup = group as FormGroup;

      for (const i of Object.keys(formGroup.controls)) {
        formGroup.get(i)?.markAsDirty();
        formGroup.get(i)?.updateValueAndValidity();
      }
    });
    return this.formGroup.valid;
  }
}
