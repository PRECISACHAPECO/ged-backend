-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 11-Maio-2023 às 16:36
-- Versão do servidor: 10.4.27-MariaDB
-- versão do PHP: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `gedagroc_ged`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `alternativa`
--

CREATE TABLE `alternativa` (
  `alternativaID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `alternativa`
--

INSERT INTO `alternativa` (`alternativaID`, `nome`, `status`) VALUES
(1, 'Sim/Não', 1),
(2, 'Sim/Não/NA', 1),
(3, 'Conforme/Não Conforme', 1),
(4, 'Conforme/Não Conforme/NA', 1),
(5, 'Dissertativa', 1),
(6, 'Data', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `alternativa_item`
--

CREATE TABLE `alternativa_item` (
  `alternativaItemID` int(11) NOT NULL,
  `alternativaID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `alternativa_item`
--

INSERT INTO `alternativa_item` (`alternativaItemID`, `alternativaID`, `nome`) VALUES
(1, 1, 'Sim'),
(2, 1, 'Não'),
(3, 2, 'Sim'),
(4, 2, 'Não'),
(5, 2, 'NA'),
(6, 3, 'Conforme'),
(7, 3, 'Não Conforme'),
(8, 4, 'Conforme'),
(9, 4, 'Não Conforme'),
(10, 4, 'NA');

-- --------------------------------------------------------

--
-- Estrutura da tabela `apresentacao`
--

CREATE TABLE `apresentacao` (
  `apresentacaoID` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo. 0->Inativo',
  `dataCadastro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `apresentacao`
--

INSERT INTO `apresentacao` (`apresentacaoID`, `nome`, `status`, `dataCadastro`) VALUES
(1, 'Sacos', 1, '2022-09-23'),
(2, 'Big Bags', 1, '2022-09-23'),
(3, 'Granel', 1, '2022-09-23');

-- --------------------------------------------------------

--
-- Estrutura da tabela `atividade`
--

CREATE TABLE `atividade` (
  `atividadeID` int(11) NOT NULL,
  `nome` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `atividade`
--

INSERT INTO `atividade` (`atividadeID`, `nome`, `status`) VALUES
(1, 'Rações', 1),
(2, 'Suplementostgtt', 1),
(3, 'Concentrados', 1),
(4, 'Ingredientes', 1),
(5, 'Alimentos', 1),
(6, 'Aditivos', 1),
(7, 'Alimentos com Medicamentos', 1),
(31933, '66y667', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `cargo`
--

CREATE TABLE `cargo` (
  `cargoID` int(11) NOT NULL,
  `nome` text NOT NULL,
  `dataCadastro` date DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `cargo`
--

INSERT INTO `cargo` (`cargoID`, `nome`, `dataCadastro`, `status`) VALUES
(1, 'Responsável Qualidade', '2023-05-02', 1),
(2, 'Responsável Produção', '2023-05-02', 1),
(3, 'Responsável Técnico', '2023-05-02', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `divisor`
--

CREATE TABLE `divisor` (
  `divisorID` int(11) NOT NULL,
  `papelID` int(11) NOT NULL COMMENT 'Cliente, Fornecedor...',
  `nome` varchar(255) NOT NULL,
  `ordem` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `divisor`
--

INSERT INTO `divisor` (`divisorID`, `papelID`, `nome`, `ordem`, `status`) VALUES
(1, 1, 'Geral', 1, 1),
(2, 1, 'Formulários', 2, 1),
(3, 1, 'Definições', 3, 1),
(4, 2, 'Geral', 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor`
--

CREATE TABLE `fornecedor` (
  `fornecedorID` int(11) NOT NULL,
  `dataAvaliacao` date DEFAULT NULL,
  `cnpj` varchar(18) NOT NULL,
  `razaoSocial` varchar(255) DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL COMMENT 'Nome Fantasia',
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `brasil` int(11) DEFAULT NULL COMMENT '1->Fornecedor do Brasil, 0->Fornecedor estrangeiro',
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `pais` varchar(255) DEFAULT NULL,
  `ie` varchar(255) DEFAULT NULL,
  `responsavel` varchar(255) DEFAULT NULL COMMENT 'Nome do fornecedor\r\nresponsável pelo preenchimento',
  `principaisClientes` varchar(255) DEFAULT NULL,
  `registroMapa` int(11) DEFAULT 0 COMMENT '1->Sim, 0->Não',
  `obs` text DEFAULT NULL COMMENT 'Obs do formulário',
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 10 COMMENT '10->Pendente (fornecedor não preencheu ainda)\r\n20->Acessou o link\r\n30->Em preenchimento (já salvou)\r\n40->Fornecedor concluiu preenchimento\r\n50->Reprovado\r\n60->Aprovado Parcial\r\n70->Aprovado\r\n',
  `atual` int(11) NOT NULL COMMENT '1->Avaliação atual desse fornecedor (última), 0->Não é a avaliação atual desse fornecedor (antiga)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `fornecedor`
--

INSERT INTO `fornecedor` (`fornecedorID`, `dataAvaliacao`, `cnpj`, `razaoSocial`, `nome`, `email`, `telefone`, `brasil`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `pais`, `ie`, `responsavel`, `principaisClientes`, `registroMapa`, `obs`, `unidadeID`, `status`, `atual`) VALUES
(1, '1899-11-30', '54.545.454/5454-54', 'Abc', 'Abc', 'contato@tozzo.com.br', '(45) 45454-5454', 0, 'aa', 'Rua Minas Gerais', 'aa33aa444', 'Sala 206', 'aa233', 'quilombo555', 'SC', 'Brasil', '545787824', 'aa', 'aa', 0, '', 1, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor_atividade`
--

CREATE TABLE `fornecedor_atividade` (
  `fornecedorAtividadeID` int(11) NOT NULL,
  `fornecedorID` int(11) NOT NULL,
  `atividadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `fornecedor_atividade`
--

INSERT INTO `fornecedor_atividade` (`fornecedorAtividadeID`, `fornecedorID`, `atividadeID`) VALUES
(1, 1, 1),
(2, 1, 3),
(4, 1, 6),
(5, 1, 5),
(6, 1, 7);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor_resposta`
--

CREATE TABLE `fornecedor_resposta` (
  `fornecedorRespostaID` int(11) NOT NULL,
  `fornecedorID` int(11) NOT NULL,
  `parFornecedorBlocoID` int(11) NOT NULL COMMENT 'ID do bloco',
  `itemID` int(11) NOT NULL,
  `resposta` varchar(255) NOT NULL COMMENT 'Descrição da resposta',
  `respostaID` int(11) NOT NULL COMMENT 'Se for resposta selecionável, guarda ID do alternativa_item',
  `obs` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `fornecedor_resposta`
--

INSERT INTO `fornecedor_resposta` (`fornecedorRespostaID`, `fornecedorID`, `parFornecedorBlocoID`, `itemID`, `resposta`, `respostaID`, `obs`) VALUES
(1, 1, 1, 2, '1992-01-27T19:57:16.531Z', 0, ''),
(2, 1, 1, 4, 'Não Conforme', 4, 'NC'),
(3, 1, 1, 12, 'New desc...', 0, ''),
(4, 1, 1, 3, '', 0, 'só obs uppp'),
(5, 1, 2, 4, 'Não Conforme', 4, '');

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor_sistemaqualidade`
--

CREATE TABLE `fornecedor_sistemaqualidade` (
  `fornecedorSistemaQualidadeID` int(11) NOT NULL,
  `fornecedorID` int(11) NOT NULL,
  `sistemaQualidadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `fornecedor_sistemaqualidade`
--

INSERT INTO `fornecedor_sistemaqualidade` (`fornecedorSistemaQualidadeID`, `fornecedorID`, `sistemaQualidadeID`) VALUES
(1, 1, 1),
(4, 1, 2),
(5, 1, 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `item`
--

CREATE TABLE `item` (
  `itemID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `parFormularioID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `item`
--

INSERT INTO `item` (`itemID`, `nome`, `parFormularioID`, `status`) VALUES
(1, 'Os colaboradores receberam treinamento em BPF - Boas Práticas de Fabricação?', 1, 1),
(2, 'É realizada conscientização dos colaboradores sobre higiene pessoal?', 1, 1),
(3, 'Os colaboradores utilizam uniformes apropriados, limpos e em bom estado de conservação?', 1, 1),
(4, 'Existe local, produtos e materiais apropriados para desinfecção das mãos?', 1, 1),
(12, 'Qual a metade de 2 + 2 ?', 1, 1),
(13, 'O veículo está limpo externamente e em condições que não comprometem a integridade do produto?\r\n\r\n', 2, 1),
(14, 'A área interna do veículo encontra-se limpa, ausente de materiais estranhos e/ou vestígios de insetos e roedores?', 2, 1),
(15, 'Não há sinais visíveis de danos (frestas, pregos, parafusos, lascas de madeira, correntes) no assoalho, teto e paredes?\r\n\r\n\r\n', 2, 1),
(16, 'Não existem indícios de umidade, vazamentos ou mofo?', 2, 1),
(17, 'Não existem indícios de produtos químicos e/ou odores característicos destes produtos?\n\n', 2, 1),
(18, 'Descrição do último produto transportado:', 2, 1),
(19, 'As cantoneiras, cintas, travas e portas apresentam-se em condições adequadas e em quantidades suficientes à proteção da carga?', 2, 1),
(20, 'As lonas encontram-se limpas, ausentes de danos (rasgos e furos), secas e sem odores?', 2, 1),
(21, 'Os produtos encontram-se dentro do prazo de validade?', 2, 1),
(22, 'Os produtos encontram-se paletizados, estrechados, sem danos (furos e /ou rasgos)?', 2, 1),
(23, 'Possui laboratório próprio ?', 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `menu`
--

CREATE TABLE `menu` (
  `menuID` int(11) NOT NULL,
  `divisorID` int(11) NOT NULL COMMENT 'Divisor do menu',
  `nome` varchar(255) NOT NULL,
  `icone` varchar(255) NOT NULL,
  `rota` varchar(255) DEFAULT NULL COMMENT 'Se nula possui sub itens',
  `ordem` int(11) NOT NULL,
  `novo` int(11) NOT NULL DEFAULT 0 COMMENT '1 => Novo\r\n0 = > ''''',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1 => Ativo\r\n0 => Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Extraindo dados da tabela `menu`
--

INSERT INTO `menu` (`menuID`, `divisorID`, `nome`, `icone`, `rota`, `ordem`, `novo`, `status`) VALUES
(1, 1, 'Início', 'material-symbols:home-outline-rounded', '/home', 1, 0, 1),
(2, 2, 'Fornecedor', 'mdi:truck-fast-outline', '/formularios/fornecedor', 2, 1, 1),
(3, 2, 'Recebimento MP', 'icon-park-outline:receive', '/formularios/recebimento-mp', 3, 0, 1),
(4, 3, 'Cadastros', 'ph:note-pencil', NULL, 4, 0, 1),
(5, 3, 'Configurações', 'ph:gear', NULL, 5, 0, 1),
(7, 4, 'Dashboard', '', '/home', 1, 0, 1),
(8, 4, 'Clientes', '', '/clientes', 2, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `papel`
--

CREATE TABLE `papel` (
  `papelID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo',
  `dataCadastro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `papel`
--

INSERT INTO `papel` (`papelID`, `nome`, `status`, `dataCadastro`) VALUES
(1, 'Fábrica', 1, '2023-05-03'),
(2, 'Fornecedor', 1, '2023-05-03'),
(3, 'Transportador', 1, '2023-05-03');

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_formulario`
--

CREATE TABLE `par_formulario` (
  `parFormularioID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tabela` varchar(255) NOT NULL,
  `obs` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_formulario`
--

INSERT INTO `par_formulario` (`parFormularioID`, `nome`, `tabela`, `obs`) VALUES
(1, 'Fornecedor', 'par_fornecedor', ''),
(2, 'Recebimento MP', 'par_recebimentomp', NULL),
(3, 'Não Conformidade', 'par_naoconformidade', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor`
--

CREATE TABLE `par_fornecedor` (
  `parFornecedorID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL DEFAULT 1 COMMENT 'Ordem de exibição no formulário',
  `nomeCampo` varchar(255) NOT NULL,
  `nomeColuna` varchar(255) NOT NULL COMMENT 'Nome da coluna no BD',
  `tipo` varchar(50) NOT NULL,
  `obs` text DEFAULT NULL COMMENT 'Obs para desenvolvimento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor`
--

INSERT INTO `par_fornecedor` (`parFornecedorID`, `ordem`, `nomeCampo`, `nomeColuna`, `tipo`, `obs`) VALUES
(1, 1, 'Data da avaliação', 'dataAvaliacao', 'date', NULL),
(2, 2, 'CNPJ', 'cnpj', 'string', NULL),
(3, 3, 'Razão Social', 'razaoSocial', 'string', NULL),
(4, 5, 'E-mail', 'email', 'string', NULL),
(5, 6, 'Telefone', 'telefone', 'string', NULL),
(6, 8, 'CEP', 'cep', 'string', NULL),
(7, 9, 'Logradouro', 'logradouro', 'string', NULL),
(8, 10, 'Nº', 'numero', 'string', 'Nº do endereço do imóvel'),
(9, 11, 'Complemento', 'complemento', 'string', NULL),
(10, 12, 'Bairro', 'bairro', 'string', NULL),
(11, 13, 'Cidade', 'cidade', 'string', NULL),
(12, 14, 'Estado', 'estado', 'string', NULL),
(13, 15, 'País', 'pais', 'string', NULL),
(14, 17, 'IE', 'ie', 'string', NULL),
(15, 4, 'Nome fantasia', 'nome', 'string', NULL),
(16, 7, 'Responsável', 'responsavel', 'string', NULL),
(17, 18, 'Principais clientes', 'principaisClientes', 'string', NULL),
(18, 19, 'Registro Mapa', 'registroMapa', 'string', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_bloco`
--

CREATE TABLE `par_fornecedor_bloco` (
  `parFornecedorBlocoID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL COMMENT 'Ordem de exibição',
  `nome` varchar(255) NOT NULL,
  `obs` int(11) NOT NULL DEFAULT 1 COMMENT '1->Possui obs no bloco, 0->Não possui obs',
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_bloco`
--

INSERT INTO `par_fornecedor_bloco` (`parFornecedorBlocoID`, `ordem`, `nome`, `obs`, `unidadeID`, `status`) VALUES
(1, 2, 'Itens Avaliados Novo', 1, 1, 1),
(2, 2, 'Itens avaliados 2', 1, 1, 1),
(3, 1, 'Itens Avaliados uni 2', 1, 2, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_bloco_atividade`
--

CREATE TABLE `par_fornecedor_bloco_atividade` (
  `parFornecedorBlocoAtividadeID` int(11) NOT NULL,
  `parFornecedorBlocoID` int(11) NOT NULL,
  `atividadeID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_bloco_atividade`
--

INSERT INTO `par_fornecedor_bloco_atividade` (`parFornecedorBlocoAtividadeID`, `parFornecedorBlocoID`, `atividadeID`, `unidadeID`) VALUES
(1, 1, 5, 1),
(3, 1, 1, 1),
(4, 2, 7, 1),
(5, 1, 3, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_bloco_item`
--

CREATE TABLE `par_fornecedor_bloco_item` (
  `parFornecedorBlocoItemID` int(11) NOT NULL,
  `parFornecedorBlocoID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL,
  `itemID` int(11) NOT NULL,
  `alternativaID` int(11) NOT NULL COMMENT 'Forma de resposta no formulário',
  `obs` int(11) NOT NULL DEFAULT 1 COMMENT '1->Possui obs, 0->Não possui obs',
  `obrigatorio` int(11) NOT NULL DEFAULT 0 COMMENT '1->Obrigatório, 0->Não obrigatório',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_bloco_item`
--

INSERT INTO `par_fornecedor_bloco_item` (`parFornecedorBlocoItemID`, `parFornecedorBlocoID`, `ordem`, `itemID`, `alternativaID`, `obs`, `obrigatorio`, `status`) VALUES
(1, 1, 1, 1, 1, 0, 1, 1),
(2, 2, 200, 3, 5, 1, 1, 1),
(3, 1, 7, 2, 6, 1, 0, 1),
(5, 3, 1, 5, 1, 1, 0, 1),
(6, 1, 4, 4, 5, 1, 1, 1),
(7, 1, 3, 3, 4, 1, 1, 1),
(8, 1, 5, 12, 5, 0, 1, 1),
(9, 2, 2, 4, 4, 1, 1, 1),
(10, 1, 6, 23, 2, 0, 1, 1),
(11, 1, 6, 23, 1, 1, 1, 1),
(12, 1, 6, 23, 1, 1, 1, 1),
(13, 1, 6, 23, 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_unidade`
--

CREATE TABLE `par_fornecedor_unidade` (
  `parFornecedorUnidadeID` int(11) NOT NULL,
  `parFornecedorID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `obrigatorio` int(11) NOT NULL DEFAULT 1 COMMENT '1->Obrigatório, 0->Não obrigatório'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_unidade`
--

INSERT INTO `par_fornecedor_unidade` (`parFornecedorUnidadeID`, `parFornecedorID`, `unidadeID`, `obrigatorio`) VALUES
(41, 19, 1, 1),
(47, 1, 1, 1),
(50, 15, 1, 1),
(63, 2, 1, 0),
(64, 3, 1, 0),
(65, 4, 1, 0),
(66, 5, 1, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_recebimentomp`
--

CREATE TABLE `par_recebimentomp` (
  `parRecebimentompID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL COMMENT 'Ordem de exibição no formulário',
  `nomeCampo` varchar(255) NOT NULL,
  `tabela` varchar(255) DEFAULT NULL COMMENT 'Somente para opções de selecionar uma alternativa (fazer join)',
  `nomeColuna` varchar(255) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `obs` text DEFAULT NULL COMMENT 'Obs pra desenvolvimento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_recebimentomp`
--

INSERT INTO `par_recebimentomp` (`parRecebimentompID`, `ordem`, `nomeCampo`, `tabela`, `nomeColuna`, `tipo`, `obs`) VALUES
(1, 1, 'Profissional', 'pessoa', 'pessoaID', 'int', NULL),
(2, 2, 'Tipo de Operação', 'tipooperacao', 'tipoOperacaoID', 'int', NULL),
(3, 3, 'Data', NULL, 'data', 'date', NULL),
(4, 4, 'NF', NULL, 'nf', 'string', NULL),
(5, 5, 'Fornecedor', 'fornecedor', 'fornecedorID', 'int', NULL),
(6, 6, 'Transportador', 'transportador', 'transportadorID', 'int', NULL),
(7, 7, 'Placa', NULL, 'placa', 'string', NULL),
(8, 8, 'Motorista', NULL, 'motorista', 'string', NULL),
(9, 9, 'Tipo de Veículo', 'tipoveiculo', 'tipoVeiculoID', 'int', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_recebimentomp_bloco`
--

CREATE TABLE `par_recebimentomp_bloco` (
  `parRecebimentompBlocoID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL COMMENT 'Ordem de exibição',
  `nome` varchar(255) NOT NULL,
  `obs` int(11) NOT NULL DEFAULT 1 COMMENT '1->Possui obs no bloco, 0->Não possui obs',
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_recebimentomp_bloco`
--

INSERT INTO `par_recebimentomp_bloco` (`parRecebimentompBlocoID`, `ordem`, `nome`, `obs`, `unidadeID`, `status`) VALUES
(1, 1, 'INSPEÇÃO DO VEÍCULO TRANSPORTADOR', 1, 1, 1),
(2, 2, 'INSPEÇÃO DE PROTEÇÃO DE CARGA', 1, 1, 1),
(3, 3, 'INSPEÇÃO DOS PRODUTOS', 0, 1, 1),
(4, 4, 'INSPEÇÃO DE DOCUMENTAÇÃO', 1, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_recebimentomp_bloco_item`
--

CREATE TABLE `par_recebimentomp_bloco_item` (
  `parRecebimentompBlocoItemID` int(11) NOT NULL,
  `parRecebimentompBlocoID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL,
  `itemID` int(11) NOT NULL,
  `alternativaID` int(11) NOT NULL COMMENT 'Forma de resposta no formulário',
  `obs` int(11) NOT NULL DEFAULT 1 COMMENT '1->Possui obs, 0->Não possui obs',
  `obrigatorio` int(11) NOT NULL DEFAULT 0 COMMENT '1->Obrigatório, 0->Não obrigatório',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_recebimentomp_bloco_item`
--

INSERT INTO `par_recebimentomp_bloco_item` (`parRecebimentompBlocoItemID`, `parRecebimentompBlocoID`, `ordem`, `itemID`, `alternativaID`, `obs`, `obrigatorio`, `status`) VALUES
(1, 1, 1, 13, 3, 1, 1, 1),
(2, 1, 2, 14, 3, 1, 1, 1),
(5, 1, 3, 15, 4, 1, 1, 1),
(6, 1, 4, 18, 5, 1, 1, 1),
(9, 2, 1, 17, 3, 1, 1, 1),
(10, 2, 2, 18, 3, 1, 1, 1),
(11, 3, 1, 19, 3, 1, 1, 1),
(12, 3, 2, 20, 3, 1, 1, 1),
(13, 4, 1, 21, 3, 1, 1, 1),
(14, 4, 2, 20, 3, 1, 0, 1),
(15, 4, 3, 18, 5, 1, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_recebimentomp_produto`
--

CREATE TABLE `par_recebimentomp_produto` (
  `parRecebimentompProdutoID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL,
  `nomeCampo` varchar(255) NOT NULL,
  `nomeColuna` varchar(255) NOT NULL,
  `tabela` varchar(255) DEFAULT NULL COMMENT 'Se houver join com outra tabela (select)',
  `tipo` varchar(10) NOT NULL,
  `obs` text DEFAULT NULL COMMENT 'Obs pra desenvolvimento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_recebimentomp_produto`
--

INSERT INTO `par_recebimentomp_produto` (`parRecebimentompProdutoID`, `ordem`, `nomeCampo`, `nomeColuna`, `tabela`, `tipo`, `obs`) VALUES
(1, 1, 'Produto', 'produtoID', 'produto', 'int', NULL),
(2, 2, 'Apresentação', 'apresentacaoID', 'apresentacao', 'int', NULL),
(3, 3, 'Quantidade', 'quantidade', NULL, 'string', NULL),
(4, 4, 'Possui Laudo?', 'possuiLaudo', NULL, 'checkbox', '');

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_recebimentomp_produto_unidade`
--

CREATE TABLE `par_recebimentomp_produto_unidade` (
  `parRecebimentompProdutoUnidadeID` int(11) NOT NULL,
  `parRecebimentompProdutoID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `obrigatorio` int(11) NOT NULL DEFAULT 0 COMMENT '1->Obrigatório, 0->Não obrigatório'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_recebimentomp_produto_unidade`
--

INSERT INTO `par_recebimentomp_produto_unidade` (`parRecebimentompProdutoUnidadeID`, `parRecebimentompProdutoID`, `unidadeID`, `obrigatorio`) VALUES
(1, 1, 1, 1),
(4, 2, 1, 0),
(5, 3, 1, 0),
(72, 0, 1, 1),
(73, 0, 1, 0),
(74, 0, 1, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_recebimentomp_unidade`
--

CREATE TABLE `par_recebimentomp_unidade` (
  `parRecebimentompUnidadeID` int(11) NOT NULL,
  `parRecebimentompID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `obrigatorio` int(11) NOT NULL DEFAULT 0 COMMENT '1->Obrigatório, 0->Não obrigatório'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_recebimentomp_unidade`
--

INSERT INTO `par_recebimentomp_unidade` (`parRecebimentompUnidadeID`, `parRecebimentompID`, `unidadeID`, `obrigatorio`) VALUES
(5, 3, 1, 1),
(6, 4, 1, 1),
(7, 1, 1, 0),
(8, 2, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `permissao`
--

CREATE TABLE `permissao` (
  `permissaoID` int(11) NOT NULL,
  `rota` varchar(255) NOT NULL,
  `papelID` int(11) NOT NULL COMMENT 'Cliente, Fornecedor...',
  `usuarioID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `ler` int(11) NOT NULL DEFAULT 0 COMMENT '1 => True\r\n0 => False',
  `inserir` int(11) NOT NULL DEFAULT 0 COMMENT '1 => True\r\n0 => False',
  `editar` int(11) NOT NULL DEFAULT 0 COMMENT '1 => True\r\n0 => False',
  `excluir` int(11) NOT NULL DEFAULT 0 COMMENT '1 => True\r\n0 => False'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Extraindo dados da tabela `permissao`
--

INSERT INTO `permissao` (`permissaoID`, `rota`, `papelID`, `usuarioID`, `unidadeID`, `ler`, `inserir`, `editar`, `excluir`) VALUES
(1, '/home', 1, 1, 1, 1, 0, 1, 1),
(2, '/formularios/fornecedor', 1, 1, 1, 1, 1, 1, 1),
(3, '/formularios/recebimento-mp', 1, 1, 1, 1, 1, 1, 1),
(4, '/cadastros/item', 1, 1, 1, 1, 1, 1, 1),
(5, '/cadastros/tipo-veiculo', 1, 1, 1, 0, 0, 0, 1),
(6, '/cadastros/apresentacao', 1, 1, 1, 1, 0, 0, 0),
(7, '/cadastros/sistema-qualidade', 1, 1, 1, 0, 0, 0, 1),
(8, '/cadastros/transportador', 1, 1, 1, 1, 0, 0, 0),
(9, '/configuracoes/usuario', 1, 1, 1, 1, 1, 1, 1),
(10, '/home', 1, 1, 3, 1, 0, 0, 0),
(11, '/formularios/fornecedor', 1, 1, 3, 1, 0, 0, 0),
(12, '/formularios/recebimento-mp', 1, 1, 3, 1, 0, 1, 0),
(13, '/configuracoes/usuario', 1, 1, 3, 1, 1, 1, 1),
(14, '/configuracoes/unidade', 1, 1, 3, 1, 1, 1, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `pessoa`
--

CREATE TABLE `pessoa` (
  `pessoaID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo',
  `dataCadastro` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `pessoa`
--

INSERT INTO `pessoa` (`pessoaID`, `nome`, `cpf`, `unidadeID`, `status`, `dataCadastro`) VALUES
(1, 'José Henry Lopes', '211.316.998-31', 1, 1, '2023-04-17'),
(2, 'Bruno Guilherme Antonio dos Santos', '344.408.221-50', 1, 1, '2023-04-17'),
(3, 'Yuri Otávio Anthony da Mota', '087.237.005-48', 1, 1, '2023-04-17'),
(4, 'Severino Francisco Rocha', '172.873.906-39', 2, 1, '2023-04-17');

-- --------------------------------------------------------

--
-- Estrutura da tabela `produto`
--

CREATE TABLE `produto` (
  `produtoID` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `unidadeMedida` varchar(20) DEFAULT NULL,
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo. 0->Inativo',
  `dataCadastro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `produto`
--

INSERT INTO `produto` (`produtoID`, `nome`, `unidadeMedida`, `unidadeID`, `status`, `dataCadastro`) VALUES
(1, 'Soja', 'Kg', 1, 1, '2022-09-23'),
(2, 'Milho', 'Kg', 1, 1, '2022-09-23'),
(3, 'Potássio', 'Kg', 1, 1, '2022-09-23'),
(4, 'Trigo', 'Kg', 1, 1, '2022-09-23');

-- --------------------------------------------------------

--
-- Estrutura da tabela `profissao`
--

CREATE TABLE `profissao` (
  `profissaoID` int(11) NOT NULL,
  `nome` text NOT NULL,
  `dataCadastro` date DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `profissao`
--

INSERT INTO `profissao` (`profissaoID`, `nome`, `dataCadastro`, `status`) VALUES
(1, 'Programador', '2023-05-02', 1),
(2, 'Eletricista', '2023-05-02', 1),
(3, 'Mecânico', '2023-05-02', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `recebimentomp`
--

CREATE TABLE `recebimentomp` (
  `recebimentompID` int(11) NOT NULL,
  `pessoaID` int(11) DEFAULT NULL COMMENT 'Profissional',
  `tipoOperacaoID` int(11) DEFAULT NULL COMMENT 'Recepção ou Expedição',
  `data` date DEFAULT NULL,
  `dataEdicao` date DEFAULT NULL,
  `dataRevisao` date DEFAULT NULL,
  `nf` varchar(255) DEFAULT NULL,
  `fornecedorID` int(11) DEFAULT NULL,
  `transportadorID` int(11) DEFAULT NULL,
  `placa` varchar(9) DEFAULT NULL,
  `motorista` varchar(255) DEFAULT NULL,
  `tipoVeiculoID` int(11) DEFAULT NULL,
  `obs` text DEFAULT NULL,
  `unidadeID` int(11) NOT NULL,
  `status` int(11) DEFAULT 10 COMMENT '10->Pendente (ainda não concluiu) \r\n20-> Concluiu preenchimento \r\n30->Reprovado \r\n40->Aprovado Parcial \r\n50->Aprovado	',
  `dataCadastro` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `recebimentomp`
--

INSERT INTO `recebimentomp` (`recebimentompID`, `pessoaID`, `tipoOperacaoID`, `data`, `dataEdicao`, `dataRevisao`, `nf`, `fornecedorID`, `transportadorID`, `placa`, `motorista`, `tipoVeiculoID`, `obs`, `unidadeID`, `status`, `dataCadastro`) VALUES
(1, 4, 1, '2023-04-17', '2023-04-17', '2023-04-17', '43434343', 1, 2, 'MKY-2000', 'Leomar Z', 2, '', 1, 50, '2023-04-17');

-- --------------------------------------------------------

--
-- Estrutura da tabela `recebimentomp_produto`
--

CREATE TABLE `recebimentomp_produto` (
  `recebimentompProdutoID` int(11) NOT NULL,
  `recebimentompID` int(11) NOT NULL,
  `produtoID` int(11) DEFAULT NULL,
  `apresentacaoID` int(11) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  `possuiLaudo` int(11) DEFAULT NULL COMMENT 'checkBox: 1->Marcado, 0->Não marcado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `recebimentomp_produto`
--

INSERT INTO `recebimentomp_produto` (`recebimentompProdutoID`, `recebimentompID`, `produtoID`, `apresentacaoID`, `quantidade`, `possuiLaudo`) VALUES
(1, 1, 1, 1, 50, 1),
(2, 1, 2, 2, 10, 0),
(4, 2, 1, 1, 3, 0),
(7, 1, 3, 1, 500, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `recebimentomp_resposta`
--

CREATE TABLE `recebimentomp_resposta` (
  `recebimentompRespostaID` int(11) NOT NULL,
  `recebimentompID` int(11) NOT NULL,
  `parRecebimentompBlocoID` int(11) NOT NULL COMMENT 'ID do bloco',
  `itemID` int(11) NOT NULL,
  `resposta` varchar(255) NOT NULL COMMENT 'Descrição da resposta',
  `respostaID` int(11) NOT NULL COMMENT 'Se for resposta selecionável, guarda ID do alternativa_item',
  `obs` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `recebimentomp_resposta`
--

INSERT INTO `recebimentomp_resposta` (`recebimentompRespostaID`, `recebimentompID`, `parRecebimentompBlocoID`, `itemID`, `resposta`, `respostaID`, `obs`) VALUES
(1, 1, 1, 13, 'Conforme', 4, 'aa'),
(2, 1, 1, 14, 'Não Conforme', 4, 'abc'),
(3, 1, 1, 15, 'NA', 4, ''),
(4, 1, 1, 16, 'NA', 4, ''),
(5, 1, 2, 17, 'Conforme', 4, 'obsss');

-- --------------------------------------------------------

--
-- Estrutura da tabela `sistemaqualidade`
--

CREATE TABLE `sistemaqualidade` (
  `sistemaQualidadeID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `sistemaqualidade`
--

INSERT INTO `sistemaqualidade` (`sistemaQualidadeID`, `nome`, `status`) VALUES
(1, '5S', 1),
(2, 'BPF', 1),
(3, 'FAMI\'QS', 1),
(4, 'ISO 9001', 1),
(5, 'FSC22000', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `submenu`
--

CREATE TABLE `submenu` (
  `submenuID` int(11) NOT NULL,
  `menuID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `icone` varchar(255) NOT NULL,
  `rota` varchar(255) NOT NULL,
  `ordem` int(11) NOT NULL,
  `novo` int(11) NOT NULL DEFAULT 0 COMMENT '1 => "Novo''\r\n0 => ""',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1 => Ativo\r\n0 => Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Extraindo dados da tabela `submenu`
--

INSERT INTO `submenu` (`submenuID`, `menuID`, `nome`, `icone`, `rota`, `ordem`, `novo`, `status`) VALUES
(1, 4, 'Atividade', 'fluent:food-grains-24-regular', '/cadastros/atividade', 1, 0, 1),
(2, 4, 'Item', 'material-symbols:format-list-bulleted-rounded', '/cadastros/item', 2, 0, 1),
(3, 4, 'Sistema de Qualidade', 'material-symbols:playlist-add-check', '/cadastros/sistema-qualidade', 3, 1, 1),
(4, 5, 'Unidade', 'mdi:company', '/configuracoes/unidade', 3, 0, 1),
(5, 5, 'Usuário', 'mdi:user', '/configuracoes/usuario', 2, 0, 1),
(6, 5, 'Formulários', 'clarity:form-line', '/configuracoes/formularios', 1, 0, 1),
(7, 4, 'Tipo de Veículo', 'mdi:truck-outline', '/cadastros/tipo-veiculo', 4, 0, 1),
(8, 4, 'Transportador', 'ph:truck-bold', '/cadastros/transportador', 6, 0, 1),
(9, 4, 'Produtos', 'ph:plant', '/cadastros/produtos', 7, 0, 1),
(10, 4, 'Apresentação', 'ri:pencil-ruler-2-line', '/cadastros/apresentacao', 8, 0, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `tipooperacao`
--

CREATE TABLE `tipooperacao` (
  `tipooperacaoID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo',
  `dataCadastro` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tipooperacao`
--

INSERT INTO `tipooperacao` (`tipooperacaoID`, `nome`, `status`, `dataCadastro`) VALUES
(1, 'RECEPÇÃO', 1, '2023-04-17'),
(2, 'EXPEDIÇÃO', 1, '2023-04-17');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tipoveiculo`
--

CREATE TABLE `tipoveiculo` (
  `tipoVeiculoID` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo. 0->Inativo',
  `dataCadastro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `tipoveiculo`
--

INSERT INTO `tipoveiculo` (`tipoVeiculoID`, `nome`, `status`, `dataCadastro`) VALUES
(1, 'Carroceria', 1, '2022-09-23'),
(2, 'Graneleiro', 1, '2022-09-23'),
(3, 'Sider', 1, '2022-09-23'),
(4, 'Tanque', 1, '2022-09-23');

-- --------------------------------------------------------

--
-- Estrutura da tabela `transportador`
--

CREATE TABLE `transportador` (
  `transportadorID` int(11) NOT NULL,
  `nome` varchar(200) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo. 0->Inativo',
  `dataCadastro` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `transportador`
--

INSERT INTO `transportador` (`transportadorID`, `nome`, `unidadeID`, `status`, `dataCadastro`) VALUES
(1, 'Lunardi', 1, 1, '2022-09-23'),
(2, 'Tozzo', 1, 1, '2022-09-23'),
(4, 'Express', 2, 1, '2023-04-13');

-- --------------------------------------------------------

--
-- Estrutura da tabela `unidade`
--

CREATE TABLE `unidade` (
  `unidadeID` int(11) NOT NULL,
  `nomeFantasia` varchar(255) NOT NULL,
  `razaoSocial` varchar(255) DEFAULT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `telefone1` varchar(20) DEFAULT NULL,
  `telefone2` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `responsavel` varchar(255) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `logradouro` varchar(255) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL COMMENT 'Nº do logradouro',
  `complemento` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `dataCadastro` date DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `unidade`
--

INSERT INTO `unidade` (`unidadeID`, `nomeFantasia`, `razaoSocial`, `cnpj`, `telefone1`, `telefone2`, `email`, `responsavel`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `dataCadastro`, `status`) VALUES
(1, 'Nutri Plus', 'Plus Plus', '11.149.451/0001-01', '(49) 335-58977', '(49) 99958-45877', 'paulo@plusmais.com', 'Paulo Luiz', '89812-600', 'Rua Euclides Prade', '465E', 'Bloco A, apto 406', 'Santa Maria', 'Chapecó', 'SC', '2023-04-26', 1),
(2, 'Precisa Tecnologia', NULL, '22.761.856/0001-12', '49984356670', NULL, 'jonatankalmeidakk5@gmail.com', 'Rodrigo Piozevan', '89812-600', 'Rua Euclides Prade', '533', 'sala 206', 'Santa Maria', 'Chapecó', 'SC', '2023-03-30', 1),
(3, 'BRF Alimentos', 'BRF Alimentos', '41.153.569/0001-74', '(49) 9994-91845', '(49) 335-24671', 'roberto@gmail.com', 'Roberto Delavi', '89812-600', 'Rua Euclides Prade', '465', 'Bloco A, apto. 406', 'Santa Maria', 'Chapecó', 'SC', '2023-04-27', 1),
(23, 'Nutri Vitalaaaaa', '565666', '13.363.709/0001-01', '(49) 98435-6670', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '18087-149', 'Avenida Fernando Stecca', '', 'Fundos', 'Iporanga', 'Sorocaba', 'SP', '2023-05-10', 1),
(24, 'Nutri Vitalaaaaa', '565666', '91.507.596/0001-76', '(49) 98435-6670', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '18087-149', 'Avenida Fernando Stecca', '11', 'Fundos', 'Iporanga', 'Sorocaba', 'SP', '2023-05-10', 1),
(25, 'tetweeee', 'Ltda Nwe', '01.116.088/0001-74', '(49) 98435-6670', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '18087-149', 'Avenida Fernando Stecca', '888', 'Fundos', 'Iporanga', 'Sorocaba', 'SP', '2023-05-10', 1),
(26, 'Ltda New', '565666', '33.485.347/0001-20', '', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '', '', '11', '', '', '', '', '2023-05-10', 1),
(27, 'Ltda New', '565666', '45.014.434/0001-89', '', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '', '', '11', '', '', '', '', '2023-05-11', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario`
--

CREATE TABLE `usuario` (
  `usuarioID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `dataNascimento` date DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `admin` int(11) NOT NULL DEFAULT 0 COMMENT '1->Acesso todo sistema, 0->Usuário normal\r\n',
  `role` varchar(255) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1 => Ativo\r\n0 => Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`usuarioID`, `nome`, `cpf`, `cnpj`, `dataNascimento`, `rg`, `email`, `senha`, `admin`, `role`, `status`) VALUES
(1, 'Roberto D Ara', '089.092.569-07', '11.149.451/0001-01', NULL, '510177319933312', 'admin@materialize.com', 'admin', 1, 'admin', 1),
(21, 'sasasa', '021.164.710-10', NULL, '1899-11-30', 'sasaas', 'saassaas', '', 0, '', 1),
(22, 'teste', '8998', NULL, '0000-00-00', '9898', '9898', '', 0, '', 1),
(23, 'sasa', '3333', NULL, '0000-00-00', '4343', '32', '', 0, '', 1),
(24, 'Novooo certo', '888975454', NULL, '0000-00-00', '5454', 'asasjsaj', '', 0, '', 1),
(25, 'Novo com senha', '047.169.888-12', NULL, '0000-00-00', '545454', 'rr@gmail.com', '123456', 0, '', 1),
(26, 'bruna', '783.131.870-42', NULL, '1996-05-20', '515', 'bruna@gmail.com', '1234', 0, '', 1),
(27, 'Nutri Vitalaaaaa', NULL, '13.363.709/0001-01', NULL, NULL, 'jonatankalmeidakk5@gmail.com', '12345', 0, 'admin', 1),
(28, 'Nutri Vitalaaaaa', NULL, '91.507.596/0001-76', NULL, NULL, 'jonatankalmeidakk5@gmail.com', '12345', 0, 'admin', 1),
(29, 'tetweeee', NULL, '01.116.088/0001-74', NULL, NULL, 'jonatankalmeidakk5@gmail.com', '12345', 0, 'admin', 1),
(30, 'Ltda New', NULL, '33.485.347/0001-20', NULL, NULL, 'jonatankalmeidakk5@gmail.com', '12345', 0, 'admin', 1),
(31, 'Ltda New', NULL, '45.014.434/0001-89', NULL, NULL, 'jonatankalmeidakk5@gmail.com', '12345', 0, 'admin', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario_unidade`
--

CREATE TABLE `usuario_unidade` (
  `usuarioUnidadeID` int(11) NOT NULL,
  `usuarioID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `papelID` int(11) NOT NULL COMMENT 'Cliente, Fornecedor...',
  `profissaoID` int(11) DEFAULT NULL,
  `registroConselhoClasse` varchar(50) DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1 => Ativo\r\n0 => Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Extraindo dados da tabela `usuario_unidade`
--

INSERT INTO `usuario_unidade` (`usuarioUnidadeID`, `usuarioID`, `unidadeID`, `papelID`, `profissaoID`, `registroConselhoClasse`, `status`) VALUES
(1, 1, 1, 1, 1, NULL, 1),
(6, 1, 3, 1, 3, NULL, 1),
(13, 21, 3, 1, NULL, 'assaas', 1),
(14, 22, 3, 1, NULL, '9898', 1),
(15, 23, 3, 1, NULL, '4334', 1),
(16, 24, 3, 1, NULL, '545', 1),
(17, 25, 3, 1, NULL, '54545', 1),
(18, 26, 1, 1, NULL, '5151', 1),
(19, 27, 23, 2, NULL, NULL, 1),
(20, 28, 24, 2, NULL, NULL, 1),
(21, 29, 25, 2, NULL, NULL, 1),
(22, 30, 26, 2, NULL, NULL, 1),
(23, 31, 27, 2, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario_unidade_cargo`
--

CREATE TABLE `usuario_unidade_cargo` (
  `usuarioUnidadeCargoID` int(11) NOT NULL,
  `usuarioUnidadeID` int(11) NOT NULL,
  `cargoID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `usuario_unidade_cargo`
--

INSERT INTO `usuario_unidade_cargo` (`usuarioUnidadeCargoID`, `usuarioUnidadeID`, `cargoID`) VALUES
(4, 5, 2),
(8, 1, 3);

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `alternativa`
--
ALTER TABLE `alternativa`
  ADD PRIMARY KEY (`alternativaID`);

--
-- Índices para tabela `alternativa_item`
--
ALTER TABLE `alternativa_item`
  ADD PRIMARY KEY (`alternativaItemID`);

--
-- Índices para tabela `apresentacao`
--
ALTER TABLE `apresentacao`
  ADD PRIMARY KEY (`apresentacaoID`);

--
-- Índices para tabela `atividade`
--
ALTER TABLE `atividade`
  ADD PRIMARY KEY (`atividadeID`);

--
-- Índices para tabela `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`cargoID`);

--
-- Índices para tabela `divisor`
--
ALTER TABLE `divisor`
  ADD PRIMARY KEY (`divisorID`);

--
-- Índices para tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  ADD PRIMARY KEY (`fornecedorID`);

--
-- Índices para tabela `fornecedor_atividade`
--
ALTER TABLE `fornecedor_atividade`
  ADD PRIMARY KEY (`fornecedorAtividadeID`);

--
-- Índices para tabela `fornecedor_resposta`
--
ALTER TABLE `fornecedor_resposta`
  ADD PRIMARY KEY (`fornecedorRespostaID`);

--
-- Índices para tabela `fornecedor_sistemaqualidade`
--
ALTER TABLE `fornecedor_sistemaqualidade`
  ADD PRIMARY KEY (`fornecedorSistemaQualidadeID`);

--
-- Índices para tabela `item`
--
ALTER TABLE `item`
  ADD PRIMARY KEY (`itemID`);

--
-- Índices para tabela `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`menuID`);

--
-- Índices para tabela `papel`
--
ALTER TABLE `papel`
  ADD PRIMARY KEY (`papelID`);

--
-- Índices para tabela `par_formulario`
--
ALTER TABLE `par_formulario`
  ADD PRIMARY KEY (`parFormularioID`);

--
-- Índices para tabela `par_fornecedor`
--
ALTER TABLE `par_fornecedor`
  ADD PRIMARY KEY (`parFornecedorID`);

--
-- Índices para tabela `par_fornecedor_bloco`
--
ALTER TABLE `par_fornecedor_bloco`
  ADD PRIMARY KEY (`parFornecedorBlocoID`);

--
-- Índices para tabela `par_fornecedor_bloco_atividade`
--
ALTER TABLE `par_fornecedor_bloco_atividade`
  ADD PRIMARY KEY (`parFornecedorBlocoAtividadeID`);

--
-- Índices para tabela `par_fornecedor_bloco_item`
--
ALTER TABLE `par_fornecedor_bloco_item`
  ADD PRIMARY KEY (`parFornecedorBlocoItemID`);

--
-- Índices para tabela `par_fornecedor_unidade`
--
ALTER TABLE `par_fornecedor_unidade`
  ADD PRIMARY KEY (`parFornecedorUnidadeID`);

--
-- Índices para tabela `par_recebimentomp`
--
ALTER TABLE `par_recebimentomp`
  ADD PRIMARY KEY (`parRecebimentompID`);

--
-- Índices para tabela `par_recebimentomp_bloco`
--
ALTER TABLE `par_recebimentomp_bloco`
  ADD PRIMARY KEY (`parRecebimentompBlocoID`);

--
-- Índices para tabela `par_recebimentomp_bloco_item`
--
ALTER TABLE `par_recebimentomp_bloco_item`
  ADD PRIMARY KEY (`parRecebimentompBlocoItemID`);

--
-- Índices para tabela `par_recebimentomp_produto`
--
ALTER TABLE `par_recebimentomp_produto`
  ADD PRIMARY KEY (`parRecebimentompProdutoID`);

--
-- Índices para tabela `par_recebimentomp_produto_unidade`
--
ALTER TABLE `par_recebimentomp_produto_unidade`
  ADD PRIMARY KEY (`parRecebimentompProdutoUnidadeID`);

--
-- Índices para tabela `par_recebimentomp_unidade`
--
ALTER TABLE `par_recebimentomp_unidade`
  ADD PRIMARY KEY (`parRecebimentompUnidadeID`);

--
-- Índices para tabela `permissao`
--
ALTER TABLE `permissao`
  ADD PRIMARY KEY (`permissaoID`);

--
-- Índices para tabela `pessoa`
--
ALTER TABLE `pessoa`
  ADD PRIMARY KEY (`pessoaID`);

--
-- Índices para tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`produtoID`);

--
-- Índices para tabela `profissao`
--
ALTER TABLE `profissao`
  ADD PRIMARY KEY (`profissaoID`);

--
-- Índices para tabela `recebimentomp`
--
ALTER TABLE `recebimentomp`
  ADD PRIMARY KEY (`recebimentompID`);

--
-- Índices para tabela `recebimentomp_produto`
--
ALTER TABLE `recebimentomp_produto`
  ADD PRIMARY KEY (`recebimentompProdutoID`);

--
-- Índices para tabela `recebimentomp_resposta`
--
ALTER TABLE `recebimentomp_resposta`
  ADD PRIMARY KEY (`recebimentompRespostaID`);

--
-- Índices para tabela `sistemaqualidade`
--
ALTER TABLE `sistemaqualidade`
  ADD PRIMARY KEY (`sistemaQualidadeID`);

--
-- Índices para tabela `submenu`
--
ALTER TABLE `submenu`
  ADD PRIMARY KEY (`submenuID`);

--
-- Índices para tabela `tipooperacao`
--
ALTER TABLE `tipooperacao`
  ADD PRIMARY KEY (`tipooperacaoID`);

--
-- Índices para tabela `tipoveiculo`
--
ALTER TABLE `tipoveiculo`
  ADD PRIMARY KEY (`tipoVeiculoID`);

--
-- Índices para tabela `transportador`
--
ALTER TABLE `transportador`
  ADD PRIMARY KEY (`transportadorID`);

--
-- Índices para tabela `unidade`
--
ALTER TABLE `unidade`
  ADD PRIMARY KEY (`unidadeID`);

--
-- Índices para tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`usuarioID`);

--
-- Índices para tabela `usuario_unidade`
--
ALTER TABLE `usuario_unidade`
  ADD PRIMARY KEY (`usuarioUnidadeID`);

--
-- Índices para tabela `usuario_unidade_cargo`
--
ALTER TABLE `usuario_unidade_cargo`
  ADD PRIMARY KEY (`usuarioUnidadeCargoID`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alternativa`
--
ALTER TABLE `alternativa`
  MODIFY `alternativaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `alternativa_item`
--
ALTER TABLE `alternativa_item`
  MODIFY `alternativaItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `apresentacao`
--
ALTER TABLE `apresentacao`
  MODIFY `apresentacaoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `atividade`
--
ALTER TABLE `atividade`
  MODIFY `atividadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31934;

--
-- AUTO_INCREMENT de tabela `cargo`
--
ALTER TABLE `cargo`
  MODIFY `cargoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `divisor`
--
ALTER TABLE `divisor`
  MODIFY `divisorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  MODIFY `fornecedorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `fornecedor_atividade`
--
ALTER TABLE `fornecedor_atividade`
  MODIFY `fornecedorAtividadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `fornecedor_resposta`
--
ALTER TABLE `fornecedor_resposta`
  MODIFY `fornecedorRespostaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `fornecedor_sistemaqualidade`
--
ALTER TABLE `fornecedor_sistemaqualidade`
  MODIFY `fornecedorSistemaQualidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `item`
--
ALTER TABLE `item`
  MODIFY `itemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `menu`
--
ALTER TABLE `menu`
  MODIFY `menuID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `papel`
--
ALTER TABLE `papel`
  MODIFY `papelID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `par_formulario`
--
ALTER TABLE `par_formulario`
  MODIFY `parFormularioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `par_fornecedor`
--
ALTER TABLE `par_fornecedor`
  MODIFY `parFornecedorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_bloco`
--
ALTER TABLE `par_fornecedor_bloco`
  MODIFY `parFornecedorBlocoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_bloco_atividade`
--
ALTER TABLE `par_fornecedor_bloco_atividade`
  MODIFY `parFornecedorBlocoAtividadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_bloco_item`
--
ALTER TABLE `par_fornecedor_bloco_item`
  MODIFY `parFornecedorBlocoItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_unidade`
--
ALTER TABLE `par_fornecedor_unidade`
  MODIFY `parFornecedorUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT de tabela `par_recebimentomp`
--
ALTER TABLE `par_recebimentomp`
  MODIFY `parRecebimentompID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `par_recebimentomp_bloco`
--
ALTER TABLE `par_recebimentomp_bloco`
  MODIFY `parRecebimentompBlocoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `par_recebimentomp_bloco_item`
--
ALTER TABLE `par_recebimentomp_bloco_item`
  MODIFY `parRecebimentompBlocoItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `par_recebimentomp_produto`
--
ALTER TABLE `par_recebimentomp_produto`
  MODIFY `parRecebimentompProdutoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `par_recebimentomp_produto_unidade`
--
ALTER TABLE `par_recebimentomp_produto_unidade`
  MODIFY `parRecebimentompProdutoUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de tabela `par_recebimentomp_unidade`
--
ALTER TABLE `par_recebimentomp_unidade`
  MODIFY `parRecebimentompUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `permissao`
--
ALTER TABLE `permissao`
  MODIFY `permissaoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `pessoa`
--
ALTER TABLE `pessoa`
  MODIFY `pessoaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `produtoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `profissao`
--
ALTER TABLE `profissao`
  MODIFY `profissaoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `recebimentomp`
--
ALTER TABLE `recebimentomp`
  MODIFY `recebimentompID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `recebimentomp_produto`
--
ALTER TABLE `recebimentomp_produto`
  MODIFY `recebimentompProdutoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `recebimentomp_resposta`
--
ALTER TABLE `recebimentomp_resposta`
  MODIFY `recebimentompRespostaID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `sistemaqualidade`
--
ALTER TABLE `sistemaqualidade`
  MODIFY `sistemaQualidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `submenu`
--
ALTER TABLE `submenu`
  MODIFY `submenuID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `tipooperacao`
--
ALTER TABLE `tipooperacao`
  MODIFY `tipooperacaoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `tipoveiculo`
--
ALTER TABLE `tipoveiculo`
  MODIFY `tipoVeiculoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `transportador`
--
ALTER TABLE `transportador`
  MODIFY `transportadorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `unidade`
--
ALTER TABLE `unidade`
  MODIFY `unidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `usuarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de tabela `usuario_unidade`
--
ALTER TABLE `usuario_unidade`
  MODIFY `usuarioUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `usuario_unidade_cargo`
--
ALTER TABLE `usuario_unidade_cargo`
  MODIFY `usuarioUnidadeCargoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
