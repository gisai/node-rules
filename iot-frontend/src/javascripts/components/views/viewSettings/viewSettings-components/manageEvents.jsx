/* IMPORT MODULES */
import React, { Component, useState } from 'react';
import axios from 'axios';
import PropTypes, { func } from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker'

/* IMPORT COMPONENTS */
import Event from '../../../lists/lists-components/event';

/* COMPONENTS */
class ManageEvents extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoaded: false,
        error: null,
        edit: false,
        elementId: '',
        // form
        name: '',
        enabled: false,
        displays: [], 
		description: '',
		userGroup:'',
		type:'time',
		configData: {
			timeData:{
				periodicity:'monthly'
			},
			actionData: {
				trigger:''
			}
		}
    };
  }
  componentDidMount() {
    const { data: { events } } = this.props;
	  this.setState({ isLoaded: true, events });
  }

  componentWillReceiveProps(nextProps) {
    const { data: { events } } = nextProps;
	  this.setState({ isLoaded: true, events });
  }

	edit = (elementId) => {
	  const { events } = this.state;
	  const {
	    name, enabled, displays, description, userGroup, type, configData
	  } = events.find(e => e._id === elementId);
	  this.setState({
	    name,
	    enabled,
	    displays,
		description,
		userGroup,
		type,
		configData,
	    elementId,
	    edit: true,
	  });
	}

	cancel = () => {
	  this.setState({
	    name: '',
	    enabled: '',
	    description: '',
		displays: '',
		userGroup: '',
		type: 'time',
		elementId: '',
		configData: {
			timeData:{
				periodicity:'monthly'
			},
			actionData: {
				trigger:''
			}
		},
	    edit: false,
	  });
	}

	handleInputChange = (event) => {
		const { target: { name, value } } = event;
		this.setState({
			[name]: value,
		});
	}

	setEventEnable = () => {
		this.setState({
			enabled : !this.state.enabled
		});
	}

	handleInputTypeChange = (event) => {
		const { target: { value } } = event;
		let type = this.state.type,
			configData = {
				timeData : {
					periodicity: '',
					date: '',
					hour: '',
					minute: ''
				},
				actionData: {
					trigger: ''
				}
			};
		if (type === 'time') {
			configData.timeData.periodicity = value;
		} else {
			configData.actionData.trigger = value;
		}
		this.setState({configData});
	}

	handleDateChange = (date) => {
		this.setState({
			selectedDate: date
		});
		this.setState(prevState => {
			let configData = Object.assign({}, prevState.configData); 
			configData.timeData = {
				date : date.toLocaleDateString(),
				hour : date.getHours().toString(),
				minute : date.getMinutes().toString()
			}
			return { configData };                                 
		  });
	}

	/* HANDLE SUBMIT */
	handleSubmit = (method) => {
	  const {
	    name, enabled, displays, description, userGroup, type, configData, edit, elementId,
	  } = this.state;
	  const { token, update, notify } = this.props;
	  // FORM DATA
	  const form = {
	    name,
	    enabled,
	    displays,
		description,
		userGroup,
		type,
		configData
	  };
	  if (description !== '') { form.description = description; }
	  axios({
	    method,
	    url: edit ? `${process.env.API_URL}events/${elementId}` : `${process.env.API_URL}events`,
	    data: form,
	    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
	  })
	    .then((res) => {
	      if (res.status === 201 || res.status === 200) {
	        switch (method) {
	          case 'put':
	            notify('Evento modificado con éxito', 'notify-success', 'save', res.data.notify);
	            update('events', res.data.resourceId, 'edit', res.data.resource); // update dataset
	            break;
	          case 'post':
	            notify('Evento creado con éxito', 'notify-success', 'upload', res.data.notify);
	            update('events', res.data.resourceId, 'add', res.data.resource); // update dataset
	            this.edit(res.data.resourceId);
	            break;
	          case 'delete':
	            notify('Evento eliminado con éxito', 'notify-success', 'trash', res.data.notify);
	            this.cancel();
	            update('events', res.data.resourceId, 'remove', res.data.resource); // update dataset
	            break;
	          default:
	            console.log('Something went wrong');
	        }
	      } else {
	        this.setState({
	          isLoaded: true,
	          error: res.data,
	        });
	      }
	    })
	    .catch(error => notify('Error al añadir/modificar un Evento', 'notify-error', 'exclamation-triangle', error.response.data.notify, 'error'));
	}

	render() {
	  const {
		events, 
		error,
		isLoaded, 
		edit, 
		elementId, 
		name, 
		enabled, 
		displays,
		description,
		userGroup,
		type,
		configData
	  } = this.state;

	  if (error) {
	    return null; // TODO: handle error
	  } if (!isLoaded) {
	    return null; // TODO: handle loading
	  }

	  const list = events.map((event) => {
	    if (event._id === elementId) {
	      return <Event event={event} key={event._id} edit={this.edit} active />;
	    }
	      return <Event event={event} key={event._id} edit={this.edit} active={false} />;
	  });
		let groupList,
			groupEmpty = false,
			deviceList,
			deviceEmpty = true,
			labelTypeOptions,
			configDataJson = configData;

		if(type === 'time'){
			labelTypeOptions = (<label><FontAwesomeIcon icon="redo-alt" className="mr-2" fixedWidth />Periodicidad</label>)
		} else {
			labelTypeOptions = (<label><FontAwesomeIcon icon="eye" className="mr-2" fixedWidth />Observable</label>)
		}

		if(Array.isArray(configData)){
				configDataJson = configData[0]; 
			}
		if (this.props.data.userGroups.length > 0){
			groupList = this.props.data.userGroups.map(userGroup => <option value={userGroup._id} key={userGroup._id}>{userGroup.name}</option>);
		}
		else {
			groupList = (<option defaultValue key='0' value=''>"No hay grupos disponibles"</option>)
			groupEmpty = true;
		}
		if (this.state.userGroup != '') {
			if(this.props.data.devices.length > 0) {
				this.props.data.devices.forEach(device => {
					if (device.userGroup._id === this.state.userGroup._id) {
						deviceList = (<option key={device._id} value={device._id}>{device.name}</option>)
						deviceEmpty = false;
					}
				});
			} else {
				deviceList = (<option defaultValue key='0' value=''>No hay dispositivos asociados al grupo</option>)
			}
		} else {
			deviceList = (<option defaultValue key='0' value=''>Seleccione un Grupo</option>)
		}
	  list.push(
			<div key="0" className="list-group-item-action list-group-item flex-column align-items-start">
			<div className="text-center elemento">
				<h4 className="mb-1">No se han encontrado {events.length > 0 && 'más'} Eventos</h4>
				<hr className="card-division" />
				<small>Número de Eventos existentes: {events.length}</small>
			</div>
			</div>,
	  );
	  return (
		<div className="card card-settings">
          <div className="card-header">
            <ul className="nav nav-pills card-header-pills justify-content-end mx-1">
              <li className="nav-item mr-auto">
                <h2 className="detalles-titulo"><FontAwesomeIcon icon='stopwatch' className="mr-2" fixedWidth />Eventos</h2>
              </li>
            </ul>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-6">
                <h3>{edit ? 'Editar evento' : 'Añadir evento'}</h3>
                <hr className="card-division" />
                <form>
                  <div className="form-row">
                    <div className="form-group col-6">
                      <label htmlFor="name"><FontAwesomeIcon icon="stopwatch" className="mr-2" fixedWidth />Nombre *</label>
                      <input type="text" className="form-control" id="name" placeholder="Nombre del Evento" name="name" value={name} onChange={this.handleInputChange} />
                    </div>
					<div className="form-group col-3">
						<label htmlFor="enabled"><FontAwesomeIcon icon="power-off" className="mr-2" fixedWidth />Activo</label>
						<input type="checkbox" className="form-control" id="enabled" placeholder="Evento activo" name="enabled" checked={enabled} onChange={this.setEventEnable} />
                  	</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="description"><FontAwesomeIcon icon="info-circle" className="mr-2" fixedWidth />Descripción</label>
                    <input type="text" className="form-control" id="description" placeholder="Descripción del evento" name="description" value={description} onChange={this.handleInputChange} />
                  </div>
				  	<div className="form-group">
                      	<label htmlFor="eventGroup"><FontAwesomeIcon icon="users" className="mr-2" fixedWidth />Grupo Responsable del Evento *</label>
                      	<div>
						  	<select disabled = {groupEmpty} className="custom-select" id="eventGroup" value={userGroup} name="userGroup" onChange={this.handleInputChange}>
							  	<option value = ''>-</option>
								{groupList}
							</select>
						</div>
					</div>
					<div className="form-group">
                      	<label htmlFor="eventDisplay"><FontAwesomeIcon icon={['far', 'window-maximize']} className="mr-2" fixedWidth />Pantallas afectadas por el Evento *</label>
                      	<div>
						  <select multiple disabled = {deviceEmpty} className="custom-select" id="eventDisplay" value={displays} name="eventDisplay" onChange={this.handleInputChange}>
						 	{deviceList}
							</select>
						</div>
					</div>
					<div className="form-group">
                      	<label htmlFor="typeEvent"><FontAwesomeIcon icon="list-alt" className="mr-2" fixedWidth />Tipo de Evento</label>
                      	<div>
						  	<select multiple= {false} className="custom-select" id="typeEvent" name="type" value={type} onChange={this.handleInputChange}>
						 		<option defaultValue value="time">Temporal (Limpiado de pantallas)</option>
								<option value="action">Acción (Actualización de pantallas)</option>
							</select>
						</div>
					</div>
					<div className="form-group">
						{labelTypeOptions}
						{
							this.state.type === 'action' ? (
							<select className="custom-select" id="typeActionOptions" name="actionOptions" value={configDataJson.actionData.trigger} onChange={this.handleInputTypeChange}>
								<option value="peopleCapacitySensor">Sensor de Aforo</option>
								<option value="airQuialitySensor">Sensor de Calidad del Aire</option>
							</select>
							): 
							<select className="custom-select" id="typeActionOptions" name="actionOptions" value={configDataJson.timeData.periodicity} onChange={this.handleInputTypeChange}>
								<option value="monthly">Mensual</option>
								<option value="weekly">Semanal</option>
								<option value="daily">Diario</option>
							</select>
						}
					</div>
					<div className="form-group">
						{
						this.state.type === 'time' ?  (
							<label htmlFor="eventDisplay"><FontAwesomeIcon icon={['far', 'calendar-alt']} className="mr-2" fixedWidth />Fecha del Evento</label>
						):null
						}
							{
								this.state.type === 'time' ? (
									configDataJson.timeData.periodicity === 'daily' ? (
										<DatePicker
										selected={this.state.selectedDate}
										onChange={(date)=>this.handleDateChange(date)}
										showTimeSelect
										showTimeSelectOnly
										timeCaption="Time"
										dateFormat="HH:mm"
										timeIntervals={30}
										timeFormat="HH:mm"
									/> 
									):
									<DatePicker
										selected={this.state.selectedDate}
										minDate={new Date()}
										onChange={(date)=>this.handleDateChange(date)}
										showTimeSelect
										timeIntervals={30}
										dateFormat="dd/MM/yyyy HH:mm"
										timeFormat="HH:mm"
									/>
								): null						
									}
					</div>
                  { !edit
                    ? <button onClick={() => this.handleSubmit('post')} type="button" className="btn btn-block btn-small btn-success"><i className="fa fa-plus-circle mr-1" aria-hidden="true" />Añadir</button>
                    : (
                      <div className="d-flex w-100 justify-content-between">
                        <button onClick={() => this.handleSubmit('put')} type="button" className="btn btn-block btn-small btn-success mr-2"><FontAwesomeIcon icon="save" className="mr-2" fixedWidth />Actualizar</button>
                        <button onClick={() => this.handleSubmit('delete')} type="button" className="btn btn-block btn-small btn-danger ml-1 mr-1"><FontAwesomeIcon icon="trash" className="mr-2" fixedWidth />Eliminar</button>
                        <button onClick={() => this.cancel()} type="button" className="btn btn-block btn-small btn-warning ml-2"><FontAwesomeIcon icon={['far', 'times-circle']} className="mr-2" fixedWidth />Cancelar</button>
                      </div>
                    )
                  }
                </form>
              </div>
              <div className="col-6">
                <h3 className="d-flex w-100 justify-content-between">Eventos<span>{events.length}</span></h3>
                <hr className="card-division" />
                <div className="list settings-list">
                  <div className="list-group mb-3">
                    {list}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
	  );
	}
}

ManageEvents.propTypes = {
  data: PropTypes.shape({}).isRequired,
  token: PropTypes.string.isRequired,
  notify: PropTypes.func,
  update: PropTypes.func,
};

ManageEvents.defaultProps = {
  notify: () => false,
  update: () => false,
};

export default ManageEvents;
