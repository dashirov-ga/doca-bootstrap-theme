const React = require('react');
const Component = require('react-pure-render/component');
const ImmutablePropTypes = require('react-immutable-proptypes');
const _ = require('lodash');
const offsetTop = require('./helpers').offsetTop;


const getLinks = (links, search) =>
  links
    .filter(link => {
      if (link.get('private')) return false;
      if (search &&
        (link.get('title') + link.get('self', {}).get('version') + link.get('self', {}).get('vendor') + link.get('self', {}).get('name')).toLowerCase().indexOf(search.toLowerCase()) === -1) {
        return false;
      }
      return true;
    });

class Sidebar extends Component {

  static propTypes = {
    schemas: ImmutablePropTypes.list.isRequired,
  };

  constructor() {
    super();
    this.handleScroll = _.throttle(this.handleScroll, 150);
  }

  state = {
    activeId: null,
    search: '',
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('keydown', this.handleKeydown);
  }

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
  }

  cancelSearch = () => {
    this.setState({ search: '' });
  }

  handleKeydown = (e) => {
    // ESC
    if (e.keyCode === 27) {
      this.cancelSearch();
    }
  }

  // highlighting of sidebar links and section toggling
  handleScroll = () => {
    // list of all link #ids
    const ids = this.props.schemas.reduce((result, schema) => {
      let res = result;
      if (!schema.get('hidden')) {
        res = res.concat([`${schema.get('html_id')}-properties`]);
      }
      return res.concat(
        schema
          .get('links')
          .filter(link => !link.get('private'))
          .map(link => link.get('html_id'))
          .toJS()
      );
    }
    , []);

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop ||
                      document.body.scrollTop || 0;

    // finds the first link that has top offset > top scroll position and breaks
    let activeId = null;
    // a small offset so the coming section is highlighted a bit sooner
    // before its main title touches the top of browser and starts disappearing
    const VERTICAL_OFFSET = 30;
    for (let i = 0; i < ids.length; i++) {
      if (offsetTop(document.getElementById(ids[i])) - VERTICAL_OFFSET > scrollTop) {
        activeId = ids[i > 0 ? i - 1 : i];
        break;
      }
    }

    // updates URL bar
    if (global.history) {
      global.history.replaceState({ id: activeId }, activeId, `#${activeId}`);
    }

    this.setState({ activeId });
  }

  render() {
    const elementStyle = { 'paddingLeft': '20px', 'color': 'gray' }
    const { schemas } = this.props;
    const { activeId, search } = this.state;

    var vendors = schemas.valueSeq().reduce((obj, x) => Object.assign(obj, { [x.get('self').get('vendor')]: {} }), {});
    var filtered_schemas = getLinks(schemas, search); 

    for (let s of filtered_schemas) {
      {/* organize schemas by vendor first, name second so hierarchy is Vendor > Name > Version  */}
      let vendor = s.get('self').get('vendor'); 
      let name = s.get('self').get('name'); 
      if ( !(name in vendors[vendor]) ) {
        vendors[vendor][name] = []; 
      }
      vendors[vendor][name].push(s);         
    }

    return (
      <nav id="sidebar-wrapper">
        <div className="search">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={this.handleSearchChange}
          />
        </div>
          {Object.keys(vendors).map( vendor => 
            <div style={elementStyle}><h3>{ vendor }</h3>
            <div id={'vendor-' + vendor } >
                {Object.keys(vendors[vendor]).map(name =>
                  <div id={'vendor-' + vendor + '-schema-' + name } style={elementStyle}><h4>{name}</h4>
                      {vendors[vendor][name].map(schema => 
                        
                        <div style={elementStyle}>
                          <a href={'#' + schema.get('html_id') + '-' + schema.get('self').get('version')}>v. {schema.get('self').get('version')}</a>
                        </div>
                      )}
                  </div>
                )}
            </div>
            </div>
          )}
      </nav>
    );
  }

}

module.exports = Sidebar;
