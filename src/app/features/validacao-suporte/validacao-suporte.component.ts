import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { DadosAprovacaoComponent } from '../../shared/components/dados-aprovacao/dados-aprovacao.component';
import { DadosInfraComponent } from '../../shared/components/dados-infra/dados-infra.component';
import { DadosSolicitacaoComponent } from '../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '../../shared/components/dados-solicitante/dados-solicitante.component';
import { GruposComponent } from '../../shared/components/grupos/grupos.component';
import { SistemasComponent } from '../../shared/components/sistemas/sistemas.component';
import { VetoresComponent } from '../../shared/components/vetores/vetores.component';
import { Etapa } from '../../shared/enums/etapa.enum';
import { WfProcessStep, WfFormData } from '../../core/workflow/model/workflow.model';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { ColaboradorModel } from '../../services/colaboradores/model/colaboradores.model';
import { EmpresaModel } from '../../services/empresas/model/empresas.model';
import { FilialModel } from '../../services/filiais/model/filiais.model';
import { GrupoModel } from '../../services/grupos/models/grupo.model';
import { UnidadeOrganizacionalModel } from '../../services/unidades/unidade.model';
import { VetorModel } from '../../shared/components/vetores/models/vetor.model';

const IMPORTS = [
  CommonModule,
  NzCardModule,
  NzNotificationModule,
  NzAlertModule,
  DadosSolicitanteComponent,
  DadosSolicitacaoComponent,
  GruposComponent,
  VetoresComponent,
  SistemasComponent,
  DadosAprovacaoComponent,
  DadosInfraComponent,
];

@Component({
  selector: 'app-validacao-suporte',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './validacao-suporte.component.html',
  styleUrl: './validacao-suporte.component.css',
})
export class ValidacaoSuporteComponent implements OnInit, AfterViewInit {
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

  @ViewChild(DadosInfraComponent, { static: false })
  dadosInfraComponent!: DadosInfraComponent;

  @ViewChild(DadosAprovacaoComponent, { static: false })
  dadosAprovacao!: DadosAprovacaoComponent;

  etapaAtual = Etapa.VALIDACAO_SUPORTE;

  possuiGruposSapiens = true;
  possuiGruposHcm = true;

  variaveisProcesso!: Record<string, unknown>;

  constructor(
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

    //carregando os dados do solicitante
    this.solicitanteComponent.formGroup.patchValue(this.variaveisProcesso);

    //carregando dados solicitacao
    this.solicitacaoComponent.formGroup.patchValue(this.variaveisProcesso);
    const colaborador = (await JSON.parse(this.variaveisProcesso['colaborador'] as string)) as ColaboradorModel;
    this.solicitacaoComponent.preencherColaborador(colaborador);

    //carregando dados grupos Sapiens
    const gruposSapiensString = this.variaveisProcesso['gruposSapiens'] as string;
    const gruposSapiens = gruposSapiensString ? (JSON.parse(gruposSapiensString) as GrupoModel[]) : [];
    this.possuiGruposSapiens = !!gruposSapiens.length;
    if (this.possuiGruposSapiens) this.gruposSapiensComponent.preencherGrupos(gruposSapiens);

    //carregando dados grupos Hcm
    const gruposHcmString = this.variaveisProcesso['gruposHcm'] as string;
    const gruposHcm = gruposHcmString ? (JSON.parse(gruposHcmString) as GrupoModel[]) : [];
    this.possuiGruposHcm = !!gruposHcm.length;
    if (this.possuiGruposHcm) this.gruposHcmComponent.preencherGrupos(gruposHcm);

    //careregando dados vetores
    if (this.possuiGruposSapiens || this.possuiGruposHcm) {
      const filiais = (await JSON.parse(this.variaveisProcesso['filialVetor'] as string)) as FilialModel[];
      const vetores = filiais.map((filial: FilialModel) => {
        const empresa = new EmpresaModel(filial.codemp, filial.nomemp);
        return new VetorModel(filial, empresa);
      });

      this.vetoresComponent.preencherVetores(vetores);
    }

    //carregando os dados de infra
    const realizouTreinamento = this.variaveisProcesso['realizouTreinamento'] === 'true';
    this.dadosInfraComponent.formGroup.controls.realizouTreinamento.setValue(realizouTreinamento);
    const criarAtualizarAD = this.variaveisProcesso['criarAtualizarAD'] === 'true';
    this.dadosInfraComponent.formGroup.controls.criarAtualizarAD.setValue(criarAtualizarAD);
    const loginUsuario = this.variaveisProcesso['loginUsuario'] as string;
    this.dadosInfraComponent.formGroup.controls.loginUsuario.setValue(loginUsuario);

    const unidadeString = this.variaveisProcesso['unidadeOrganizacional'] as string;
    const unidade = unidadeString ? ((await JSON.parse(unidadeString)) as UnidadeOrganizacionalModel) : null;
    if (unidade) this.dadosInfraComponent.listaUnidades = [unidade];

    this.dadosInfraComponent.formGroup.controls.unidadeOrganizacional.setValue(unidade);
  }

  async enviaEtapa(processStep: WfProcessStep): Promise<WfFormData> {
    const acaoEscolhida = processStep.nextAction.name;

    if (['Solicitar Revisão', 'Reprovar'].includes(acaoEscolhida)) {
      this.dadosAprovacao.setNecessitaJustificativa(true);

      if (!this.dadosAprovacao.estaValido()) {
        this.notificationService.error('Erro', 'Dados de Justificativa Inválidos!');
        this.workflowService.abortSubmit();
      }

      const usuario = `${this.workflowService.getUser().fullname} (${this.workflowService.getUser().username}) - T.I. SUPORTE`;
      const dadosEtapa = {
        justificativaRevisao: this.dadosAprovacao.formGroup.controls.justificativaRevisao.value,
        quemSolicitouRevisao: usuario || '',
      };

      return { formData: dadosEtapa };
    }

    const realizouTreinamento = this.dadosInfraComponent.formGroup.controls.realizouTreinamento.value;

    this.dadosAprovacao.setNecessitaJustificativa(false);
    if (!realizouTreinamento) {
      this.notificationService.error('Erro', 'O Usuário precisa ter realizado o treinamento!');
      this.workflowService.abortSubmit();
    }

    const dadosEtapa = {
      realizouTreinamento: realizouTreinamento,
    };

    return { formData: dadosEtapa };
  }
}
