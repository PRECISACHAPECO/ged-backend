-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 05-Abr-2023 às 13:12
-- Versão do servidor: 10.4.22-MariaDB
-- versão do PHP: 7.4.27

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
-- Estrutura da tabela `atividade`
--

CREATE TABLE `atividade` (
  `atividadeID` int(11) NOT NULL,
  `nome` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(7, 'Alimentos com Medicamentos', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor`
--

CREATE TABLE `fornecedor` (
  `fornecedorID` int(11) NOT NULL,
  `dataAvaliacao` date DEFAULT NULL,
  `cnpj` varchar(18) NOT NULL,
  `razaoSocial` varchar(255) DEFAULT NULL,
  `nomeFantasia` varchar(255) DEFAULT NULL,
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
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `fornecedor`
--

INSERT INTO `fornecedor` (`fornecedorID`, `dataAvaliacao`, `cnpj`, `razaoSocial`, `nomeFantasia`, `email`, `telefone`, `brasil`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `pais`, `ie`, `responsavel`, `principaisClientes`, `registroMapa`, `unidadeID`, `status`) VALUES
(1, '1899-11-30', '62.159.265/0001-94', 'BRF Alimentos', 'abcdsds', 'brf@brf.com.br', '(49) 3322-0587', 0, '89.801-200', 'Rua Minas Gerais', '533E', 'Sala 206', 'Presidente Médici', 'quilombo555', 'SC', 'Brasil', '545787824', 'aaasdds', 'Nostra Casa, Santa Maria e Fenix', 1, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor_atividade`
--

CREATE TABLE `fornecedor_atividade` (
  `fornecedorAtividadeID` int(11) NOT NULL,
  `fornecedorID` int(11) NOT NULL,
  `atividadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `fornecedor_atividade`
--

INSERT INTO `fornecedor_atividade` (`fornecedorAtividadeID`, `fornecedorID`, `atividadeID`) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 1, 4);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor_sistemaqualidade`
--

CREATE TABLE `fornecedor_sistemaqualidade` (
  `fornecedorSistemaQualidadeID` int(11) NOT NULL,
  `fornecedorID` int(11) NOT NULL,
  `sistemaQualidadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `fornecedor_sistemaqualidade`
--

INSERT INTO `fornecedor_sistemaqualidade` (`fornecedorSistemaQualidadeID`, `fornecedorID`, `sistemaQualidadeID`) VALUES
(1, 1, 1),
(2, 1, 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `item`
--

CREATE TABLE `item` (
  `itemID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `item`
--

INSERT INTO `item` (`itemID`, `nome`, `status`) VALUES
(1, 'Os colaboradores receberam treinamento em BPF - Boas Práticas de Fabricação?', 1),
(2, 'É realizada conscientização dos colaboradores sobre higiene pessoal?', 1),
(3, 'Os colaboradores utilizam uniformes apropriados, limpos e em bom estado de conservação?', 1),
(4, 'Existe local, produtos e materiais apropriados para desinfecção das mãos?', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_formulario`
--

CREATE TABLE `par_formulario` (
  `parFormularioID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tabela` varchar(255) NOT NULL,
  `obs` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `par_formulario`
--

INSERT INTO `par_formulario` (`parFormularioID`, `nome`, `tabela`, `obs`) VALUES
(1, 'Fornecedor', 'par_fornecedor', ''),
(2, 'Recepção', 'par_recepcao', NULL),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(15, 4, 'Nome fantasia', 'nomeFantasia', 'string', NULL),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `par_fornecedor_bloco`
--

INSERT INTO `par_fornecedor_bloco` (`parFornecedorBlocoID`, `ordem`, `nome`, `obs`, `unidadeID`, `status`) VALUES
(1, 2, 'aaa', 1, 1, 1),
(2, 2, 'Itens avaliados', 1, 1, 1),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `par_fornecedor_bloco_item`
--

INSERT INTO `par_fornecedor_bloco_item` (`parFornecedorBlocoItemID`, `parFornecedorBlocoID`, `ordem`, `itemID`, `alternativaID`, `obs`, `obrigatorio`, `status`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1),
(2, 2, 200, 3, 5, 1, 1, 1),
(3, 1, 99, 2, 6, 1, 0, 1),
(5, 3, 1, 5, 1, 1, 0, 1),
(6, 1, 4, 4, 5, 1, 1, 1),
(7, 1, 3, 3, 4, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_unidade`
--

CREATE TABLE `par_fornecedor_unidade` (
  `parFornecedorUnidadeID` int(11) NOT NULL,
  `parFornecedorID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL,
  `obrigatorio` int(11) NOT NULL DEFAULT 1 COMMENT '1->Obrigatório, 0->Não obrigatório'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `par_fornecedor_unidade`
--

INSERT INTO `par_fornecedor_unidade` (`parFornecedorUnidadeID`, `parFornecedorID`, `unidadeID`, `obrigatorio`) VALUES
(39, 17, 1, 0),
(40, 2, 1, 0),
(41, 19, 1, 1),
(46, 16, 1, 1),
(47, 1, 1, 1),
(48, 18, 1, 0),
(49, 3, 1, 0),
(50, 15, 1, 1),
(51, 4, 1, 0),
(52, 5, 1, 0),
(53, 6, 1, 0),
(54, 11, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `sistemaqualidade`
--

CREATE TABLE `sistemaqualidade` (
  `sistemaQualidadeID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `dataCadastro` date DEFAULT current_timestamp(),
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `unidade`
--

INSERT INTO `unidade` (`unidadeID`, `nomeFantasia`, `razaoSocial`, `cnpj`, `telefone1`, `telefone2`, `email`, `responsavel`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `dataCadastro`, `status`) VALUES
(15, 'Precisa Tecnologia uppp', NULL, '22.761.856/0001-12', '49984356670', NULL, 'jonatankalmeidakk5@gmail.com', 'Rodrigo Piozevan', '89812-600', 'Rua Euclides Prade', '533', 'sala 206', 'Santa Maria', 'Chapecó', 'SC', '2023-03-30', 1),
(16, 'testetetete', NULL, '24.823.262/0001-14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-03-30', 1),
(17, 'JONATAN DOS SANTOS DE ALMEIDAgtrrt', NULL, '74.852.665/0001-60', '49984356670', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '18087-149', 'Avenida Fernando Stecca', NULL, NULL, 'Iporanga', 'Sorocaba', 'SP', '2023-03-30', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario`
--

CREATE TABLE `usuario` (
  `usuarioID` int(11) NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unidadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`usuarioID`, `nome`, `cpf`, `email`, `senha`, `role`, `unidadeID`) VALUES
(1, 'Jonatanh', '089.092.569-07', 'admin@materialize.com', 'admin', 'admin', 1);

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
-- Índices para tabela `atividade`
--
ALTER TABLE `atividade`
  ADD PRIMARY KEY (`atividadeID`);

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
-- Índices para tabela `sistemaqualidade`
--
ALTER TABLE `sistemaqualidade`
  ADD PRIMARY KEY (`sistemaQualidadeID`);

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
-- AUTO_INCREMENT de tabela `atividade`
--
ALTER TABLE `atividade`
  MODIFY `atividadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31933;

--
-- AUTO_INCREMENT de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  MODIFY `fornecedorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `fornecedor_atividade`
--
ALTER TABLE `fornecedor_atividade`
  MODIFY `fornecedorAtividadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `fornecedor_sistemaqualidade`
--
ALTER TABLE `fornecedor_sistemaqualidade`
  MODIFY `fornecedorSistemaQualidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `item`
--
ALTER TABLE `item`
  MODIFY `itemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `parFornecedorBlocoItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_unidade`
--
ALTER TABLE `par_fornecedor_unidade`
  MODIFY `parFornecedorUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de tabela `sistemaqualidade`
--
ALTER TABLE `sistemaqualidade`
  MODIFY `sistemaQualidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `unidade`
--
ALTER TABLE `unidade`
  MODIFY `unidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `usuarioID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
