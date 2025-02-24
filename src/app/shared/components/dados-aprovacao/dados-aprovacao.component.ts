import { Component, Input, OnInit } from '@angular/core';
import { Etapa } from '../../enums/etapa.enum';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';

const IMPORTS = [ReactiveFormsModule, NzFormModule, NzInputModule, NzGridModule];

@Component({
  selector: 'app-dados-aprovacao',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './dados-aprovacao.component.html',
  styleUrl: './dados-aprovacao.component.css',
})
export class DadosAprovacaoComponent implements OnInit {
  @Input()
  etapaAtual!: Etapa;

  Etapa = Etapa;

  formGroup!: FormGroup<{
    justificativaRevisao: FormControl<null>;
    quemSolicitouRevisao: FormControl<null>;
  }>;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.moldaFormGroup();
  }

  moldaFormGroup() {
    return this.formBuilder.group({
      justificativaRevisao: [
        { value: null, disabled: [Etapa.SOLICITACAO, Etapa.REVISAO, Etapa.DETALHES].includes(this.etapaAtual) },
      ],
      quemSolicitouRevisao: [{ value: null, disabled: true }],
    });
  }

  setNecessitaJustificativa(value: boolean) {
    if (value) {
      this.formGroup.controls.justificativaRevisao.setValidators([Validators.required]);
    } else {
      this.formGroup.controls.justificativaRevisao.clearValidators();
    }
  }

  estaValido() {
    this.formGroup.controls.justificativaRevisao.markAsDirty();
    this.formGroup.controls.justificativaRevisao.updateValueAndValidity();
    return this.formGroup.valid;
  }
}
