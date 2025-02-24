import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject, takeUntil } from 'rxjs';
import { SolicitanteModel } from '../../../services/solicitante/model/solicitante.model';
import { SolicitanteService } from '../../../services/solicitante/solicitante.service';
import { Etapa } from '../../enums/etapa.enum';

const IMPORTS = [ReactiveFormsModule, NzFormModule, NzInputModule, NzGridModule];

@Component({
  selector: 'app-dados-solicitante',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './dados-solicitante.component.html',
  styleUrl: './dados-solicitante.component.css',
})
export class DadosSolicitanteComponent implements OnInit, OnDestroy {
  @Input()
  etapaAtual = Etapa.SOLICITACAO;

  @Output()
  buscandoDadosSolicitante = new EventEmitter<boolean>();

  formGroup = this.formBuilder.group({
    nomeSolicitante: [{ value: '', disabled: true }],
    loginSolicitante: [{ value: '', disabled: true }],
    empresaSolicitante: [{ value: '', disabled: true }],
    localSolicitante: [{ value: '', disabled: true }],
    cargoSolicitante: [{ value: '', disabled: true }],
  });

  private onDestoy$ = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private solicitanteService: SolicitanteService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    if (this.etapaAtual === Etapa.SOLICITACAO) {
      this.buscarDadosSolicitante();
    }
  }

  buscarDadosSolicitante() {
    this.buscandoDadosSolicitante.emit(true);
    this.solicitanteService
      .buscarDadosSolicitantes()
      .pipe(takeUntil(this.onDestoy$))
      .subscribe({
        next: retorno => {
          this.buscandoDadosSolicitante.emit(false);

          if (!retorno.outputData || retorno.outputData.responseCode !== 200) {
            this.notificationService.error('Erro', 'Erro ao buscar dados do solicitante');
            return;
          }

          this.preencherDadosSolicitante(retorno.outputData);
        },
        error: () => {
          this.notificationService.error('Erro', 'Erro ao buscar dados do solicitante');
          this.buscandoDadosSolicitante.emit(false);
        },
      });
  }

  preencherDadosSolicitante(solicitante: SolicitanteModel) {
    this.formGroup.controls.nomeSolicitante.setValue(solicitante.nomfun);
    this.formGroup.controls.loginSolicitante.setValue(solicitante.nomusu);
    this.formGroup.controls.empresaSolicitante.setValue(solicitante.razsoc);
    this.formGroup.controls.localSolicitante.setValue(solicitante.nomloc);
    this.formGroup.controls.cargoSolicitante.setValue(solicitante.titcar);
  }

  estaValido() {
    return !!this.formGroup.controls.nomeSolicitante.value;
  }

  ngOnDestroy(): void {
    this.onDestoy$.next(null);
    this.onDestoy$.complete();
  }
}
