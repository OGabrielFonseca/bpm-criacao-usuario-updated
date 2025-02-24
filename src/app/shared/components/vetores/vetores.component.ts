import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject, filter, Subject, Subscription, takeUntil } from 'rxjs';
import { ColaboradorModel } from '../../../services/colaboradores/model/colaboradores.model';
import { EmpresasService } from '../../../services/empresas/empresas.service';
import { EmpresaModel } from '../../../services/empresas/model/empresas.model';
import { FiliaisService } from '../../../services/filiais/filiais.service';
import { FilialModel } from '../../../services/filiais/model/filiais.model';
import { Etapa } from '../../enums/etapa.enum';
import { mapArray } from '../../utils/array.utils';
import { VetorFormModel, VetorModel } from './models/vetor.model';

const IMPORTS = [
  ReactiveFormsModule,
  NzFormModule,
  NzGridModule,
  NzSelectModule,
  NzInputModule,
  NzTableModule,
  NzButtonModule,
  NzIconModule,
];

@Component({
  selector: 'app-vetores',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './vetores.component.html',
  styleUrl: './vetores.component.css',
})
export class VetoresComponent implements OnInit {
  @Input()
  etapaAtual!: Etapa;

  @Input()
  set dadosColaborador(dadosColaborador: ColaboradorModel) {
    this._dadosColaborador = dadosColaborador;
  }

  get dadosColaborador() {
    return this._dadosColaborador;
  }

  @Output()
  enviaBuscandoAbrangencia = new EventEmitter<boolean>();

  formGroup = this.formBuilder.group({
    vetores: this.formBuilder.array([] as VetorFormModel[]),
  });

  Etapa = Etapa;

  empresasLista: EmpresaModel[] = [];
  inscricaoEmpresas!: Subscription;
  buscandoEmpresas = false;

  filiaisLista: FilialModel[][] = [];
  inscricaoFiliais: Subscription[] = [];
  buscandoFiliais = false;

  inscricaoAbrangencia!: Subscription;

  _dadosColaborador!: ColaboradorModel;

  onDestroy$ = new Subject();
  private suppressValueChanges = new BehaviorSubject<boolean>(false);

  get vetoresFormArray() {
    return this.formGroup.controls.vetores;
  }

  constructor(
    private formBuilder: FormBuilder,
    private empresasService: EmpresasService,
    private filiaisService: FiliaisService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    if ([Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual)) {
      this.adicionarVetor();
      this.buscarEmpresas();
    }
  }

  moldaVetorFormGroup(vetorModel?: VetorModel) {
    const formGroup = this.formBuilder.group({
      empresaVetor: [
        {
          value: vetorModel?.empresaVetor || null,
          disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual),
        },
        [Validators.required],
      ],
      filialVetor: [
        {
          value: vetorModel?.filialVetor || null,
          disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual),
        },
        [Validators.required, this.filialUnica()],
      ],
    }) as VetorFormModel;

    this.aoSelecionarEmpresa(formGroup);

    return formGroup;
  }

  aoSelecionarEmpresa(formGroup: VetorFormModel) {
    formGroup.controls.empresaVetor.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        filter(() => !this.suppressValueChanges.value),
      )
      .subscribe({
        next: empresa => {
          if (empresa) {
            formGroup.controls.filialVetor.enable();
            formGroup.controls.filialVetor.setValue(null);
            const idx = this.vetoresFormArray.controls.indexOf(formGroup);
            this.filiaisLista[idx] = [];
            this.buscarFiliais(empresa, idx);
          }
        },
      });
  }

  empresasIguais(empresa1: EmpresaModel | null, empresa2: EmpresaModel | null) {
    console.log(empresa1, empresa2);
    return empresa1 && empresa2 ? empresa1.codemp === empresa2.codemp : empresa1 === empresa2;
  }

  adicionarVetor(vetor?: VetorModel) {
    this.vetoresFormArray.push(this.moldaVetorFormGroup(vetor));
  }

  buscarEmpresas() {
    this.buscandoEmpresas = true;

    if (this.inscricaoEmpresas) {
      this.inscricaoEmpresas.unsubscribe();
    }
    this.inscricaoEmpresas = this.empresasService.buscarEmpresas().subscribe({
      next: retorno => {
        this.buscandoEmpresas = false;
        if (retorno.outputData.responseCode !== 200) {
          this.notificationService.error('Erro', 'Erro ao buscar empresas!');
          return;
        }

        const empresas = mapArray<EmpresaModel>(retorno.outputData.empresas);
        const empresasUnicas = empresas.filter(
          (empresa, index, self) => index === self.findIndex(e => e.codemp === empresa.codemp),
        );
        this.empresasLista = empresasUnicas;
      },
      error: () => {
        this.buscandoEmpresas = false;
        this.notificationService.error('Erro', 'Erro ao buscar empresas!');
      },
    });
  }

  buscarFiliais(empresa: EmpresaModel, idx: number) {
    if (this.inscricaoFiliais[idx]) {
      this.inscricaoFiliais[idx].unsubscribe();
    }

    this.buscandoFiliais = true;
    this.inscricaoFiliais[idx] = this.filiaisService.buscarFiliais(empresa.codemp).subscribe({
      next: retorno => {
        this.buscandoFiliais = false;

        if (retorno.outputData.responseCode !== 200) {
          this.notificationService.error('Erro', 'Erro ao buscar filiais!');
          return;
        }
        const filiais = mapArray<FilialModel>(retorno.outputData.filiais);
        const filiaisUnicas = filiais.filter(
          (filial, index, self) =>
            index === self.findIndex(f => f.codemp === filial.codemp && f.codfil === filial.codfil),
        );
        this.filiaisLista[idx] = filiaisUnicas;
      },
      error: () => {
        this.buscandoFiliais = false;
      },
    });
  }

  preencherVetores(vetores: VetorModel[]) {
    this.vetoresFormArray.clear();
    vetores.forEach(vetor => {
      const empresa = vetor.empresaVetor;
      const filial = vetor.filialVetor;

      if (!empresa || !filial) return;

      if (empresa && !this.empresasLista.some(emp => emp.codemp === empresa.codemp)) {
        this.empresasLista.push(empresa);
      }
      this.filiaisLista.push([filial]);
      this.adicionarVetor(vetor);
    });
  }

  comparaEmpresas(emp1: EmpresaModel, emp2: EmpresaModel) {
    return emp1 && emp2 ? emp1.codemp == emp2.codemp : emp1 === emp2;
  }

  comparaFiliais(f1: FilialModel, f2: FilialModel) {
    return f1 && f2 ? f1.codfil == f2.codfil : f1 === f2;
  }

  filialUnica() {
    return (control: AbstractControl) => {
      if (!control || !control.parent || !control.parent.parent) {
        return null;
      }

      const filialControl = control.value as FilialModel;
      const formGroup = control.parent as FormGroup;
      const indexFormGroup = this.vetoresFormArray.controls.indexOf(formGroup);

      const filialRepete = this.vetoresFormArray.controls.some((group, index) => {
        const filial = group.controls.filialVetor.value as FilialModel;
        return filial && filialControl
          ? filial.codfil === filialControl.codfil && filial.codemp === filialControl.codemp && index !== indexFormGroup
          : filial === filialControl && index !== indexFormGroup;
      });

      return filialRepete ? { repete: true } : null;
    };
  }

  estaValido() {
    this.suppressValueChanges.next(true);
    this.vetoresFormArray.controls.forEach(group => {
      const formGroup = group as FormGroup;

      for (const i of Object.keys(formGroup.controls)) {
        formGroup.get(i)?.markAsDirty();
        formGroup.get(i)?.updateValueAndValidity();
      }
    });

    this.suppressValueChanges.next(false);
    return this.formGroup.valid;
  }
}
