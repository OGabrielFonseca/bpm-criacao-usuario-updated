import { CommonModule } from '@angular/common';
import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { WfFormData } from '../../core/workflow/model/workflow.model';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { ColaboradorModel } from '../../services/colaboradores/model/colaboradores.model';
import { EmpresaModel } from '../../services/empresas/model/empresas.model';
import { FilialModel } from '../../services/filiais/model/filiais.model';
import { GrupoModel } from '../../services/grupos/models/grupo.model';
import { DadosAprovacaoComponent } from '../../shared/components/dados-aprovacao/dados-aprovacao.component';
import { DadosSolicitacaoComponent } from '../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '../../shared/components/dados-solicitante/dados-solicitante.component';
import { GruposComponent } from '../../shared/components/grupos/grupos.component';
import { GrupoFormModel } from '../../shared/components/grupos/models/grupo-form.model';
import { SistemasComponent } from '../../shared/components/sistemas/sistemas.component';
import { VetorModel } from '../../shared/components/vetores/models/vetor.model';
import { VetoresComponent } from '../../shared/components/vetores/vetores.component';
import { Etapa } from '../../shared/enums/etapa.enum';

const IMPORTS = [
  CommonModule,
  FormsModule,
  NzCardModule,
  NzNotificationModule,
  NzSwitchModule,
  DadosSolicitanteComponent,
  DadosSolicitacaoComponent,
  GruposComponent,
  VetoresComponent,
  SistemasComponent,
  DadosAprovacaoComponent,
];

@Component({
  selector: 'app-revisao',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './revisao.component.html',
  styleUrl: './revisao.component.css',
})
export class RevisaoComponent implements OnInit, AfterViewInit {
  @ViewChild(DadosSolicitanteComponent, { static: false })
  solicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: false })
  solicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild('gruposSapiens', { static: false })
  gruposSapiensComponent!: GruposComponent;

  @ViewChild('gruposHcm', { static: false })
  gruposHcmComponent!: GruposComponent;

  @ViewChild(VetoresComponent, { static: false })
  vetoresComponent!: VetoresComponent;

  @ViewChild(SistemasComponent, { static: false })
  sistemasComponent!: SistemasComponent;

  @ViewChild(DadosAprovacaoComponent, { static: false })
  aprovacaoComponent!: DadosAprovacaoComponent;

  etapaAtual = Etapa.REVISAO;

  buscandoDadosSolicitante = false;

  possuiGruposSapiens = true;
  possuiGruposHcm = true;
  desabilitaGruposSapiens = false;
  desabilitaGruposHcm = false;

  colaborador!: ColaboradorModel;
  colaboradorEhTerceiro = false;

  variaveisProcesso: Record<string, unknown> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private workflowService: WorkflowService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.workflowService.onSubmit(this.enviaEtapa.bind(this));
  }

  async ngAfterViewInit(): Promise<void> {
    await this.workflowService.requestProcessVariables().then(retorno => {
      this.variaveisProcesso = retorno;
    });

    this.preencherDados();
  }

  enviaEtapa(): WfFormData {
    const dadosEtapa = this.gerarDadosEtapa();

    return {
      formData: dadosEtapa,
    };
  }

  gerarDadosEtapa(): Record<string, unknown> {
    if (!this.solicitanteComponent.estaValido()) {
      this.notificationService.error('Erro', 'Solicitante não encontrado!');
      this.workflowService.abortSubmit();
    }

    if (!this.solicitacaoComponent.estaValido()) {
      this.notificationService.error('Erro', 'Dados do solicitante inválidos');
      this.workflowService.abortSubmit();
    }

    if (!this.sistemasComponent.estaValido()) {
      this.notificationService.error('Erro', 'Dados dos sistemas inválidos');
      this.workflowService.abortSubmit();
    }

    const aprovadoresUnicos = new Set<string>();

    let gruposSapiens: GrupoModel[] = [];

    if (this.possuiGruposSapiens) {
      if (!this.gruposSapiensComponent.estaValido()) {
        this.notificationService.error('Erro', 'Dados dos grupos inválidos');
        this.workflowService.abortSubmit();
      }

      const gruposFormArray = this.gruposSapiensComponent.formArray.getRawValue() as GrupoFormModel[];
      gruposSapiens = gruposFormArray.map(grupo => grupo.grupo as GrupoModel);
      gruposSapiens.forEach(grupo => {
        if (grupo.nomapr) aprovadoresUnicos.add(grupo.nomapr);
      });
    }

    let gruposHcm: GrupoModel[] = [];

    if (this.possuiGruposHcm) {
      if (!this.gruposHcmComponent.estaValido()) {
        this.notificationService.error('Erro', 'Dados dos grupos inválidos');
        this.workflowService.abortSubmit();
      }

      const gruposFormArray = this.gruposHcmComponent.formArray.getRawValue() as GrupoFormModel[];
      gruposHcm = gruposFormArray.map(grupo => grupo.grupo as GrupoModel);
      gruposHcm.forEach(grupo => {
        if (grupo.nomapr) aprovadoresUnicos.add(grupo.nomapr);
      });
    }

    const empresas: EmpresaModel[] = [];
    const filiais: FilialModel[] = [];

    if (this.possuiGruposHcm || this.possuiGruposSapiens) {
      if (!this.vetoresComponent.estaValido()) {
        this.notificationService.error('Erro', 'Dados dos vetores inválidos');
        this.workflowService.abortSubmit();
      }

      const vetores = this.vetoresComponent.vetoresFormArray.getRawValue();
      vetores.forEach(vetor => {
        if (vetor.empresaVetor) empresas.push(vetor.empresaVetor);
        if (vetor.filialVetor) filiais.push(vetor.filialVetor);
      });
    }

    const aprovadores = Array.from(aprovadoresUnicos);
    const colaborador = this.solicitacaoComponent.formGroup.controls.nomeColaborador.value as ColaboradorModel;

    const dadosEtapa = {
      localColaborador: colaborador.nomloc,
      cargoColaborador: colaborador.titcar,
      nomeColaborador: colaborador.nomfun,
      gestorAprovador: colaborador.resccu,
      emailSolicitante: this.workflowService.getUser().email,
      usuarioSolicitante: this.workflowService.getUser().username,
      nomeSolicitante: this.solicitanteComponent.formGroup.controls.nomeSolicitante.value,
      empresaSolicitante: this.solicitanteComponent.formGroup.controls.empresaSolicitante.value,
      localSolicitante: this.solicitanteComponent.formGroup.controls.localSolicitante.value,
      cargoSolicitante: this.solicitanteComponent.formGroup.controls.cargoSolicitante.value,
      colaborador: JSON.stringify(colaborador),
      telefoneColaborador: this.solicitacaoComponent.formGroup.controls.telefoneColaborador.value,
      ramalColaborador: this.solicitacaoComponent.formGroup.controls.ramalColaborador.value,
      informacoesAdicionais: this.solicitacaoComponent.formGroup.controls.informacoesAdicionais.value,
      gruposSapiens: this.possuiGruposSapiens ? JSON.stringify(gruposSapiens) : null,
      gruposHcm: this.possuiGruposHcm ? JSON.stringify(gruposHcm) : null,
      sistemaSapiens: this.possuiGruposSapiens,
      sistemaHcm: this.possuiGruposHcm,
      empresaVetor: JSON.stringify(empresas),
      filialVetor: JSON.stringify(filiais),
      aprovadores: aprovadores.join(';'),
      proximoAprovador: aprovadores.length ? aprovadores[0] : '',
      sistemaEngeman: this.sistemasComponent.formGroup.controls.sistemaEngeman.value
        ? this.sistemasComponent.formGroup.controls.sistemaEngeman.value
        : false,
      perfilEngeman: this.sistemasComponent.formGroup.controls.perfilEngeman.value,
      sistemaGatec: this.sistemasComponent.formGroup.controls.sistemaGatec.value
        ? this.sistemasComponent.formGroup.controls.sistemaGatec.value
        : false,
      perfilGatec: this.sistemasComponent.formGroup.controls.perfilGatec.value,
      sistemaMega: this.sistemasComponent.formGroup.controls.sistemaMega.value
        ? this.sistemasComponent.formGroup.controls.sistemaMega.value
        : false,
      perfilMega: this.sistemasComponent.formGroup.controls.perfilMega.value,
      sistemaGestaoMineracao: this.sistemasComponent.formGroup.controls.sistemaGestaoMineracao.value
        ? this.sistemasComponent.formGroup.controls.sistemaGestaoMineracao.value
        : false,
      perfilGestaoMineracao: this.sistemasComponent.formGroup.controls.perfilGestaoMineracao.value,
    };

    return dadosEtapa;
  }

  preencherDados() {
    //carregando os dados do solicitante
    this.solicitanteComponent.formGroup.patchValue(this.variaveisProcesso);

    //carregando dados solicitacao
    this.solicitacaoComponent.formGroup.patchValue(this.variaveisProcesso);
    const colaborador = JSON.parse(this.variaveisProcesso['colaborador'] as string) as ColaboradorModel;
    this.solicitacaoComponent.preencherColaborador(colaborador, false);
    this.colaborador = colaborador;
    this.colaboradorEhTerceiro = colaborador.tipcol === '2';

    //carregando dados grupos Sapiens
    const gruposSapiensString = this.variaveisProcesso['gruposSapiens'] as string;
    const gruposSapiens = gruposSapiensString ? (JSON.parse(gruposSapiensString) as GrupoModel[]) : [];
    this.possuiGruposSapiens = !!gruposSapiens.length;
    this.appRef.tick();
    if (this.possuiGruposSapiens) this.gruposSapiensComponent.preencherGrupos(gruposSapiens);

    //carregando dados grupos Hcm
    const gruposHcmString = this.variaveisProcesso['gruposHcm'] as string;
    const gruposHcm = gruposHcmString ? (JSON.parse(gruposHcmString) as GrupoModel[]) : [];
    this.possuiGruposHcm = !!gruposHcm.length;
    this.appRef.tick();
    if (this.possuiGruposHcm) this.gruposHcmComponent.preencherGrupos(gruposHcm);

    //careregando dados vetores
    if (this.possuiGruposSapiens || this.possuiGruposHcm) {
      const filiais = JSON.parse(this.variaveisProcesso['filialVetor'] as string) as FilialModel[];
      const vetores = filiais.map((filial: FilialModel) => {
        const empresa = new EmpresaModel(filial.codemp, filial.nomemp);
        return new VetorModel(filial, empresa);
      });

      this.vetoresComponent.preencherVetores(vetores);
    }

    //carregando dados sistemas
    this.sistemasComponent.preencherDadosSistemas(this.variaveisProcesso);

    //carregando dados revisao
    this.aprovacaoComponent.formGroup.patchValue(this.variaveisProcesso);
  }

  aoBuscarDadosSolicitante(event: boolean) {
    this.buscandoDadosSolicitante = event;
    this.cdr.detectChanges();
  }

  recebeColaborador(colaborador: ColaboradorModel) {
    this.possuiGruposSapiens = false;
    this.possuiGruposHcm = false;
    this.appRef.tick();
    this.colaborador = colaborador;

    if (colaborador.nomusu) {
      this.limparDadosColaborador();
      return;
    }

    this.habilitarGruposHcm();

    if (colaborador.tipcol !== '2') {
      this.habilitarGruposSapiens();
    }
    this.appRef.tick();
  }

  limparDadosColaborador() {
    this.desabilitaGruposSapiens = true;
    this.desabilitaGruposHcm = true;
    this.possuiGruposSapiens = false;
    this.possuiGruposHcm = false;
  }

  habilitarGruposHcm() {
    this.desabilitaGruposHcm = false;
    this.possuiGruposHcm = true;
  }

  habilitarGruposSapiens() {
    this.desabilitaGruposSapiens = false;
    this.possuiGruposSapiens = true;
  }
}