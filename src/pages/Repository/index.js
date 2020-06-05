import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter, IssuePage } from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    repository: {},
    issues: [],
    loading: true,
    filters: [
      { id: 0, label: 'Todos', value: 'all', active: true },
      { id: 1, label: 'Aberto', value: 'open', active: false },
      { id: 2, label: 'Fechado', value: 'closed', active: false },
    ],
    filterSelect: 0,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filters } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters.find((f) => f.active).value,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadingFile = async () => {
    const { match } = this.props;
    const { filters, filterSelect, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterSelect].value,
        per_page: 5,
        page,
      },
    });

    this.setState({
      issues: response.data,
    });
  };

  handleFilter = async (id) => {
    this.setState({ filterSelect: id });
    this.loadingFile();
  };

  handlePage = async (option) => {
    const { page } = this.state;
    if (option === 'back') {
      this.setState({ page: page - 1 });
    } else {
      this.setState({ page: page + 1 });
    }
    this.loadingFile();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      filterSelect,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <IssueFilter active={filterSelect}>
            {filters.map((filter) => (
              <button
                key={String(filter.id)}
                type="button"
                onClick={() => this.handleFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </IssueFilter>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
          <IssuePage>
            <button
              type="button"
              disabled={page < 2}
              onClick={() => this.handlePage('back')}
            >
              <FaArrowLeft color={page < 2 ? '#000' : '#fff'} />
            </button>
            <span>{page}</span>
            <button type="button" onClick={() => this.handlePage('next')}>
              <FaArrowRight color="#fff" />
            </button>
          </IssuePage>
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
