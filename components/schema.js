const React = require('react');
const Endpoint = require('./endpoint');
const ObjectDefinitionTable = require('./objectDefinitionTable');
const MarkdownPreview = require('react-marked-markdown').MarkdownPreview;
const ImmutablePropTypes = require('react-immutable-proptypes');
const Component = require('react-pure-render/component');
const ExampleObject = require('./exampleObject');

class Schema extends Component {

  static propTypes = {
    schema: ImmutablePropTypes.map.isRequired,
  };

  state = {
      showDefinition: true,
      showJsonpath: false,
      showSql: false
  };

  handleToggle = (toShow) => {
    this.setState(prevState => ({
      showDefinition: toShow=='def',
      showJsonpath: toShow=='jso',
      showSql: toShow=='sql'
    }));
  };


  render() {
    const { schema } = this.props;
    const { showDefinition } = this.state;
    const { showJsonpath } = this.state.showJsonpath;
    const { showSql } = this.state.showSql;
    var schema_id = schema.get('self').get('vendor').replace(/\./g, '-') + '-' + schema.get('self').get('name') + '-' + schema.get('self').get('version') ; 
    return (
      <article id={schema_id}  className="panel panel-primary">
        <div className="panel-heading">
          <h2>{schema.get('title')? schema.get('title') : schema.get('self').get('name')} v. {schema.get('self').get('version')}</h2>
        </div>

        <div className="panel-body">
          <h4>{schema.get('description')}</h4>
          {schema.get('extended_description') &&
            <MarkdownPreview value={schema.get('extended_description')} />}

          <header>
            <h4 id={`${schema_id}-properties`}>
              Object definition{schema.getIn(['object_definition', 'objects']).count() > 0 &&
                <span>s</span>}
            </h4>
            <p>View properties and constraints defined on the object</p>

            <div>
              <ul className="nav nav-tabs">
                <li className={this.state.showDefinition ? 'active' : 'inactive'} onClick={() => this.handleToggle('def')} key='def'><a >Definition</a></li>
                <li className={this.state.showJsonpath ? 'active' : 'inactive'} onClick={() => this.handleToggle('jso')} key='jso'><a >Jsonpaths</a></li>
                <li className={this.state.showSql ? 'active' : 'inactive'} onClick={() => this.handleToggle('sql')} key='sql'><a >SQL</a></li>
              </ul>
            </div>
          </header>

          { this.state.showDefinition && 
            <div>
              {schema.getIn(['object_definition', 'objects']).count() ?
                <div>
                  {schema.getIn(['object_definition', 'objects']).valueSeq().map(obj =>
                    <div key={obj.get('title')}>
                      {obj.get('title') &&
                        <div>
                          <h4>{obj.get('title')}</h4>
                        </div>
                      }
                      {obj.get('example') && <ExampleObject example={obj.get('example')} />}
                      <ObjectDefinitionTable definitions={obj.get('all_props')} />
                    </div>
                  )}
                </div>
              :
                <div>
                  {schema.getIn(['object_definition', 'example']) &&
                    <ExampleObject example={schema.getIn(['object_definition', 'example'])} />
                  }

                  <ObjectDefinitionTable
                    definitions={schema.getIn(['object_definition', 'all_props'])}
                  />
                </div>
              }
            </div>
          }

          {/* sorry if this isn't the most efficient way to avoid a comma at the end of the list :-/  */} 
          { this.state.showJsonpath &&
            <div>
                <div>
                  {schema.get('jsonpaths') &&
                    <pre>
                    {'{\"jsonpaths\" : ['}
                      {schema.get('jsonpaths').slice(0, -1).map((item) => <div>    "{item}",</div> )}
                      {schema.get('jsonpaths').slice(-1).map((item) => <div>    "{item}"</div> )}
                    {']}'}
                    </pre>
                  }
                </div>

            </div>
          }

          { this.state.showSql &&
            <div>
                <pre>
                  {schema.get('sql')}
                </pre>

            </div>
          }

        </div>
        <div className="list-group">
          {schema
            .get('links')
            .filter(link => !link.get('private'))
            .valueSeq()
            .map(link => <Endpoint key={link.get('html_id') + '-' + link.get('self').get('version')} link={link} />)
          }
        </div>
      </article>
    );
  }

}

module.exports = Schema;
