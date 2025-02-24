import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule, NzFormTooltipIcon } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Etapa } from '../../enums/etapa.enum';
import { SistemasFormModel } from './models/sistemas-form.model';

const IMPORTS = [
  ReactiveFormsModule,
  NzFormModule,
  NzGridModule,
  NzInputModule,
  NzTableModule,
  NzIconModule,
  NzCheckboxModule,
];

@Component({
  selector: 'app-sistemas',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './sistemas.component.html',
  styleUrl: './sistemas.component.css',
})
export class SistemasComponent implements OnInit {
  @Input()
  etapaAtual!: Etapa;

  formGroup!: SistemasFormModel;

  tooptipIcon = { type: 'info-circle', theme: 'twotone' } as NzFormTooltipIcon;

  tooltipTitle = 'Informe as características do usuário ou o perfil semelhante';

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.moldaFormGroup();
  }

  moldaFormGroup() {
    return this.formBuilder.group({
      sistemaEngeman: [{ value: false, disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) }],
      perfilEngeman: [{ value: '', disabled: true }],
      sistemaGatec: [{ value: false, disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) }],
      perfilGatec: [{ value: '', disabled: true }],
      sistemaMega: [{ value: false, disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) }],
      perfilMega: [{ value: '', disabled: true }],
      sistemaGestaoMineracao: [
        { value: false, disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) },
      ],
      perfilGestaoMineracao: [{ value: '', disabled: true }],
    });
  }

  get sistemaEngeman(): boolean | null {
    return this.formGroup.controls.sistemaEngeman.value;
  }

  get sistemaGatec(): boolean | null {
    return this.formGroup.controls.sistemaGatec.value;
  }

  get sistemaMega(): boolean | null {
    return this.formGroup.controls.sistemaMega.value;
  }

  get sistemaGestaoMineracao(): boolean | null {
    return this.formGroup.controls.sistemaGestaoMineracao.value;
  }

  necessitaPerfil(checkbox: boolean | string, control: FormControl) {
    if ([Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual)) {
      if (checkbox == true || checkbox == 'true') {
        control?.enable();
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
        control?.setValue(null);
        control?.disable();
      }
    }
  }

  preencherDadosSistemas(variaveisProcesso: Record<string, unknown>) {
    const sistemaEngeman = variaveisProcesso['sistemaEngeman'] == 'true' ? true : false;
    const sistemaGatec = variaveisProcesso['sistemaGatec'] == 'true' ? true : false;
    const sistemaMega = variaveisProcesso['sistemaMega'] == 'true' ? true : false;
    const sistemaGestaoMineracao = variaveisProcesso['sistemaGestaoMineracao'] == 'true' ? true : false;

    this.formGroup.controls.sistemaEngeman.setValue(sistemaEngeman);
    this.formGroup.controls.sistemaGatec.setValue(sistemaGatec);
    this.formGroup.controls.sistemaMega.setValue(sistemaMega);
    this.formGroup.controls.sistemaGestaoMineracao.setValue(sistemaGestaoMineracao);

    this.formGroup.controls.perfilEngeman.setValue(variaveisProcesso['perfilEngeman'] as string);
    this.formGroup.controls.perfilGatec.setValue(variaveisProcesso['perfilGatec'] as string);
    this.formGroup.controls.perfilMega.setValue(variaveisProcesso['perfilMega'] as string);
    this.formGroup.controls.perfilGestaoMineracao.setValue(variaveisProcesso['perfilGestaoMineracao'] as string);
  }

  estaValido() {
    this.formGroup.controls.perfilEngeman.markAsDirty();
    this.formGroup.controls.perfilEngeman.updateValueAndValidity();
    this.formGroup.controls.perfilGatec.markAsDirty();
    this.formGroup.controls.perfilGatec.updateValueAndValidity();
    this.formGroup.controls.perfilMega.markAsDirty();
    this.formGroup.controls.perfilMega.updateValueAndValidity();
    this.formGroup.controls.perfilGestaoMineracao.markAsDirty();
    this.formGroup.controls.perfilGestaoMineracao.updateValueAndValidity();

    return this.formGroup.valid;
  }
}
