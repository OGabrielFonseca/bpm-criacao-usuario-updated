import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ColaboradoresService } from '../../../services/colaboradores/colaboradores.service';
import { ColaboradorModel } from '../../../services/colaboradores/model/colaboradores.model';
import { Etapa } from '../../enums/etapa.enum';
import { mapArray } from '../../utils/array.utils';
import { DadosSolicitacaoFormGroupModel } from './models/dados-solicitacao-form.model';

const IMPORTS = [
  ReactiveFormsModule,
  NzFormModule,
  NzInputModule,
  NzGridModule,
  NzSelectModule,
  NzInputNumberModule,
  NzIconModule,
];

@Component({
  selector: 'app-dados-solicitacao',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './dados-solicitacao.component.html',
  styleUrls: ['./dados-solicitacao.component.css'],
})
export class DadosSolicitacaoComponent implements OnInit, OnDestroy {
  @Input()
  etapaAtual!: Etapa;

  @Output()
  enviaColaborador = new EventEmitter<ColaboradorModel>();

  private onDestoy$ = new Subject();
  private suppressValueChanges = new BehaviorSubject<boolean>(false);

  colaboradoresLista: ColaboradorModel[] = [];
  inscricaoColaboradores!: Subscription;
  colaboradoresSubject = new Subject<string>();
  skipColaboradores = 0;
  pesquisaColaborador = 'A';
  buscandoColaboradores = false;

  formGroup!: DadosSolicitacaoFormGroupModel;

  constructor(
    private formBuilder: FormBuilder,
    private colaboradoresService: ColaboradoresService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.moldaFormGroup();
    this.buscarColaboradores();
    this.aoSelecionarColaborador();
  }

  moldaFormGroup() {
    return this.formBuilder.group({
      nomeColaborador: [
        {
          value: null as null | ColaboradorModel,
          disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual),
        },
        [Validators.required],
      ],
      matriculaColaborador: [{ value: '', disabled: true }],
      empresaColaborador: [{ value: '', disabled: true }],
      filialColaborador: [{ value: '', disabled: true }],
      tipoColaborador: [{ value: '', disabled: true }],
      localColaborador: [{ value: '', disabled: true }],
      cargoColaborador: [{ value: '', disabled: true }],
      usuarioColaborador: [{ value: '', disabled: true }, [this.usuarioJaCriado]],
      telefoneColaborador: [{ value: '', disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) }],
      ramalColaborador: [{ value: '', disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) }],
      informacoesAdicionais: [{ value: '', disabled: ![Etapa.SOLICITACAO, Etapa.REVISAO].includes(this.etapaAtual) }],
    });
  }

  pesquisaColaboradores(pesquisaColaborador: string) {
    if (!pesquisaColaborador || pesquisaColaborador === this.pesquisaColaborador) return;

    this.pesquisaColaborador = pesquisaColaborador;
    this.skipColaboradores = 0;
    this.colaboradoresLista = [];
    this.buscandoColaboradores = true;
    this.colaboradoresSubject.next(pesquisaColaborador);
  }

  buscarColaboradores() {
    this.colaboradoresSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(750),
        switchMap((pesquisa: string) =>
          this.colaboradoresService.buscarColaboradores(pesquisa, this.skipColaboradores),
        ),
      )
      .pipe(takeUntil(this.onDestoy$))
      .subscribe({
        next: retorno => {
          this.buscandoColaboradores = false;

          if (retorno.outputData.responseCode !== 200) {
            this.notificationService.error('Erro', 'Erro ao buscar colaboradores');

            return;
          }

          const colaboradores = mapArray<ColaboradorModel>(retorno.outputData.colaboradores);
          this.colaboradoresLista.push(...colaboradores);
        },
        error: () => {
          this.notificationService.error('Erro', 'Erro ao buscar colaboradores');
          this.buscandoColaboradores = false;
        },
      });
  }

  adicionaMaisColaboradores() {
    if (!this.pesquisaColaborador) return;
    this.skipColaboradores += 10;
    this.buscandoColaboradores = true;
    this.colaboradoresSubject.next(this.pesquisaColaborador);
  }

  aoSelecionarColaborador() {
    this.formGroup.controls.nomeColaborador.valueChanges
      .pipe(
        takeUntil(this.onDestoy$),
        filter(() => !this.suppressValueChanges.value),
      )
      .subscribe(colaborador => {
        if (!colaborador) return;

        this.enviaColaborador.emit(colaborador);
        this.preencherDadosColaborador(colaborador);
      });
  }

  preencherDadosColaborador(colaborador: ColaboradorModel) {
    this.formGroup.controls.matriculaColaborador.setValue(colaborador.numcad);
    this.formGroup.controls.empresaColaborador.setValue(colaborador.empSap);
    this.formGroup.controls.filialColaborador.setValue(colaborador.filSap);
    this.formGroup.controls.tipoColaborador.setValue(colaborador.destip);
    this.formGroup.controls.localColaborador.setValue(colaborador.nomloc);
    this.formGroup.controls.cargoColaborador.setValue(colaborador.titcar);
    this.formGroup.controls.usuarioColaborador.setValue(colaborador.nomusu);

    if (!colaborador.nomusu) {
      this.formGroup.controls.usuarioColaborador.enable();
      this.formGroup.controls.usuarioColaborador.markAsDirty();
      this.formGroup.controls.usuarioColaborador.updateValueAndValidity();
      return;
    }

    this.formGroup.controls.usuarioColaborador.disable();
    this.formGroup.controls.usuarioColaborador.updateValueAndValidity();
  }

  preencherColaborador(colaborador: ColaboradorModel, emitirEvento = true) {
    this.colaboradoresLista.push(colaborador);
    this.formGroup.controls.nomeColaborador.setValue(colaborador, { emitEvent: emitirEvento });

    if (!emitirEvento) this.preencherDadosColaborador(colaborador);
  }

  converteTelefone(telefone = 0) {
    if (!telefone) return '';
    const telefoneFormatado =
      telefone.toString().length > 11
        ? telefone.toString().slice(0, 11)
        : (telefone.toString() + '000000000000').slice(0, 11);
    return telefoneFormatado.replace(/\D+/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  converteRamal(ramal = 0) {
    if (!ramal) return '';
    const ramalFormatado =
      ramal.toString().length > 11 ? ramal.toString().slice(0, 4) : (ramal.toString() + '0000').slice(0, 4);
    return ramalFormatado;
  }

  usuarioJaCriado(control: AbstractControl) {
    if (!control || !control.parent) return null;

    return control.value ? { usuarioJaCriado: true } : null;
  }

  estaValido() {
    this.suppressValueChanges.next(true);

    this.formGroup.controls.usuarioColaborador.markAsDirty();
    this.formGroup.controls.usuarioColaborador.updateValueAndValidity();
    this.formGroup.controls.nomeColaborador.markAsDirty();
    this.formGroup.controls.nomeColaborador.updateValueAndValidity();

    this.suppressValueChanges.next(false);
    return this.formGroup.valid;
  }

  ngOnDestroy(): void {
    this.onDestoy$.next(null);
    this.onDestoy$.complete();
  }
}
