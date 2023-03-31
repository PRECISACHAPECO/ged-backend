-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 31-Mar-2023 às 13:25
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
  `unidadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `fornecedor`
--

INSERT INTO `fornecedor` (`fornecedorID`, `dataAvaliacao`, `cnpj`, `razaoSocial`, `nomeFantasia`, `email`, `telefone`, `brasil`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `pais`, `ie`, `responsavel`, `principaisClientes`, `registroMapa`, `unidadeID`) VALUES
(1, '2023-03-20', '62.159.265/0001-94', 'BRF Alimentos', 'BRF Alimentos', 'brf@brf.com.br', '(49) 3322-0587', 1, '89.801-200', 'Rua Minas Gerais', '533E', 'Sala 206', 'Presidente Médici', 'Chapecó', 'SC', 'Brasil', '545787824', 'Rodrigo Piovesan', 'Nostra Casa, Santa Maria e Fenix', 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `item`
--

CREATE TABLE `item` (
  `itemID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `tabela` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_formulario`
--

INSERT INTO `par_formulario` (`parFormularioID`, `nome`, `tabela`) VALUES
(1, 'Fornecedor', 'par_fornecedor'),
(2, 'Recepção', 'par_recepcao'),
(3, 'Não Conformidade', 'par_naoconformidade');

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor`
--

CREATE TABLE `par_fornecedor` (
  `parFornecedorID` int(11) NOT NULL,
  `ordem` int(11) NOT NULL DEFAULT 1 COMMENT 'Ordem de exibição no formulário',
  `nomeCampo` varchar(255) NOT NULL,
  `nomeColuna` varchar(255) NOT NULL COMMENT 'Nome da coluna no BD',
  `obs` text DEFAULT NULL COMMENT 'Obs para desenvolvimento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor`
--

INSERT INTO `par_fornecedor` (`parFornecedorID`, `ordem`, `nomeCampo`, `nomeColuna`, `obs`) VALUES
(1, 1, 'Data da avaliação', 'dataAvaliacao', NULL),
(2, 2, 'CNPJ', 'cnpj', NULL),
(3, 3, 'Razão Social', 'razaoSocial', NULL),
(4, 5, 'E-mail', 'email', NULL),
(5, 6, 'Telefone', 'telefone', NULL),
(6, 7, 'CEP', 'cep', NULL),
(7, 8, 'Logradouro', 'logradouro', NULL),
(8, 9, 'Nº', 'numero', 'Nº do endereço do imóvel'),
(9, 10, 'Complemento', 'complemento', NULL),
(10, 11, 'Bairro', 'bairro', NULL),
(11, 12, 'Cidade', 'cidade', NULL),
(12, 13, 'Estado', 'estado', NULL),
(13, 14, 'País', 'pais', NULL),
(14, 15, 'IE', 'ie', NULL),
(15, 4, 'Nome fantasia', 'nomeFantasia', NULL),
(16, 0, 'Responsável', 'responsavel', NULL),
(17, 1, 'Principais clientes', 'principaisClientes', NULL),
(18, 1, 'Registro Mapa', 'registroMapa', NULL),
(19, 1, 'Brasil', 'brasil', '1->Fornecedor do Brasil, 0->Fornecedor estrangeiro');

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_bloco`
--

CREATE TABLE `par_fornecedor_bloco` (
  `parFornecedorBlocoID` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `obs` int(11) NOT NULL DEFAULT 1 COMMENT '1->Possui obs no bloco, 0->Não possui obs',
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_bloco`
--

INSERT INTO `par_fornecedor_bloco` (`parFornecedorBlocoID`, `nome`, `obs`, `status`) VALUES
(1, 'Itens Avaliados', 1, 1),
(2, 'Itens avaliados 2', 1, 1);

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
  `unidadeID` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1 COMMENT '1->Ativo, 0->Inativo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_bloco_item`
--

INSERT INTO `par_fornecedor_bloco_item` (`parFornecedorBlocoItemID`, `parFornecedorBlocoID`, `ordem`, `itemID`, `alternativaID`, `obs`, `obrigatorio`, `unidadeID`, `status`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1),
(2, 1, 2, 2, 1, 1, 1, 1, 1),
(3, 1, 3, 3, 1, 1, 0, 1, 1),
(4, 1, 1, 1, 1, 1, 0, 2, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `par_fornecedor_bloco_unidade`
--

CREATE TABLE `par_fornecedor_bloco_unidade` (
  `parFornecedorBlocoUnidadeID` int(11) NOT NULL,
  `parFornecedorBlocoID` int(11) NOT NULL,
  `unidadeID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `par_fornecedor_bloco_unidade`
--

INSERT INTO `par_fornecedor_bloco_unidade` (`parFornecedorBlocoUnidadeID`, `parFornecedorBlocoID`, `unidadeID`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 1, 2);

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
(38, 1, 1, 0),
(39, 17, 1, 0),
(40, 2, 1, 0);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `unidade`
--

INSERT INTO `unidade` (`unidadeID`, `nomeFantasia`, `razaoSocial`, `cnpj`, `telefone1`, `telefone2`, `email`, `responsavel`, `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `dataCadastro`, `status`) VALUES
(15, 'Precisa Tecnologia', NULL, '22.761.856/0001-12', '49984356670', NULL, 'jonatankalmeidakk5@gmail.com', 'Rodrigo Piozevan', '89801-200', 'Rua Minas Gerais', '533', 'sala 206', 'Precidente Médice', 'Chapecó', 'SC', '2023-03-30', 1),
(16, 'testetetete', NULL, '24.823.262/0001-14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2023-03-30', 1),
(17, 'JONATAN DOS SANTOS DE ALMEIDAgtrrt', NULL, '74.852.665/0001-60', '49984356670', NULL, 'jonatankalmeidakk5@gmail.com', NULL, '18087-149', 'Avenida Fernando Stecca', NULL, NULL, 'Iporanga', 'Sorocaba', 'SP', '2023-03-30', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario`
--

CREATE TABLE `usuario` (
  `usuarioID` int(11) NOT NULL,
  `usarname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`usuarioID`, `usarname`, `email`, `password`, `role`) VALUES
(1, 'Jonatanh', 'jonatan@gmail.com', '12345', 'admin');

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
-- Índices para tabela `par_fornecedor_bloco_item`
--
ALTER TABLE `par_fornecedor_bloco_item`
  ADD PRIMARY KEY (`parFornecedorBlocoItemID`);

--
-- Índices para tabela `par_fornecedor_bloco_unidade`
--
ALTER TABLE `par_fornecedor_bloco_unidade`
  ADD PRIMARY KEY (`parFornecedorBlocoUnidadeID`);

--
-- Índices para tabela `par_fornecedor_unidade`
--
ALTER TABLE `par_fornecedor_unidade`
  ADD PRIMARY KEY (`parFornecedorUnidadeID`);

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
  MODIFY `parFornecedorBlocoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_bloco_item`
--
ALTER TABLE `par_fornecedor_bloco_item`
  MODIFY `parFornecedorBlocoItemID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_bloco_unidade`
--
ALTER TABLE `par_fornecedor_bloco_unidade`
  MODIFY `parFornecedorBlocoUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `par_fornecedor_unidade`
--
ALTER TABLE `par_fornecedor_unidade`
  MODIFY `parFornecedorUnidadeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
