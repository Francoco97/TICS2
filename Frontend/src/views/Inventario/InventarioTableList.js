import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MaterialTable from 'material-table';
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import Alert from '@material-ui/lab/Alert';
import { Grid } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import {  Button
          , DatePicker } from 'antd';

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  picker: {
    height: 50
  },
  formControl: {
    marginHorizontal: 10,
    minWidth: 160,
  },
  selectEmpty: {
    marginTop: 20,
  },
  root: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  botonera: {
    marginRight: "auto",
    marginLeft: 20,
    marginBottom: 10
  },
  botonañadir: {
    width: 150,
  },
  añadirestilo: {
    margin: 'auto',
    marginBottom:20,
  },
  formañadir: {
    marginLeft: 5,
    marginRight: 5
  }
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" target="_blank" href="https://cadisjoyas.cl/">
        Joyeía Cadis
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default class InventarioTableList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: 0,
      estado:null,
      estadosucursal:null,
      perfil: null,
      priv_emple: null,
      priv_priv: null,
      ListaProductos: null,
      ListaProductosPeriodo: null,
      desde: "",
      hasta: "",
      periodo : false,
      sucursal : null,
      ready: false,
    }
    this.handleChange = this.handleChange.bind(this)
    this.AgregarProducto = this.AgregarProducto.bind(this)
    this.ActualizarInventario = this.ActualizarInventario.bind(this)
    this.EditarProducto = this.EditarProducto.bind(this)
    this.EliminarProducto = this.EliminarProducto.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChange2 = this.onChange2.bind(this)
    this.ActualizarInventarioPeriodo = this.ActualizarInventarioPeriodo.bind(this)
  }

  getUsuario = () => {
    let info = JSON.parse(localStorage.getItem('usuario'));
    this.setState({
      perfil: info,
      isReady: true,
      priv_emple: info.gestion_empleado,
      priv_priv: info.gestion_privilegios,
    })
  }

  ActualizarInventario() {
    fetch('/productos')
      .then(res => {
          console.log(res);
          return res.json()
      })
      .then(users => {
          this.setState({ListaProductos: users, ready: true})
          console.log(this.state.ListaProductos)
      });
  }

  ActualizarInventarioPeriodo() {
    fetch('/productos_periodo', {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      desde : this.state.desde,
      hasta : this.state.hasta
    })
    })
    .then(res => {
        return res.json()
    })
    .then(users => {
        this.setState({ListaProductosPeriodo: users})
        this.setState({periodo: true})
    });
  }

  componentDidMount() {
    this.getUsuario();
    this.ActualizarInventario();

  }

  handleChange(event, newValue) {
    this.setState({tabIndex: newValue, mensaje:null, estado: null});
    console.log(this.state.tabIndex)
  }

  actualizarTexto(event, id, value) {
    this.setState({id: value});
  }

  AgregarProducto(newData) {
    let regex = new RegExp("^[ñÑ a-z A-Z]+$");
    if(regex.test(newData.tipo) && regex.test(newData.material) && regex.test(newData.piedra)){
      if(newData.codigo.toString().indexOf('.') === -1 && newData.precio.toString().indexOf('.') === -1){
        fetch('/agregar_prod', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: newData.codigo,
          material: newData.material,
          tipo: newData.tipo,
          piedra: newData.piedra,
          precio: newData.precio,
          descripcion: newData.descripcion,
          sucursal: this.state.perfil.sucursal.toString()
        })
        })
        .then( (response) => {
            if(response.status === 201) {
                console.log("Añadido correctamente")
                this.setState({estado:1})
                this.setState({estadosucursal:1})
            } else {
                console.log('Hubo un error')
                this.setState({estado:2})
                this.setState({estadosucursal:2})
            }
        })
        .catch((error) => {
            console.log(error)
        });
      }else{
        this.setState({mensaje: 6});
      }
    }else{
      this.setState({mensaje: 5})
    }
  }

  EditarProducto(newData) {
    let regex = new RegExp("^[a-z A-Z]+$");
    if(regex.test(newData.material) && regex.test(newData.tipo) && regex.test(newData.piedra)){
      if(newData.codigo.toString().indexOf('.') === -1 && newData.precio.toString().indexOf('.') === -1){
        fetch('/editar_prod/' + newData._id, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newData._id,
          codigo: newData.codigo,
          material: newData.material,
          tipo: newData.tipo,
          piedra: newData.piedra,
          precio: newData.precio,
          descripcion: newData.descripcion,
          sucursal: this.state.perfil.sucursal.toString()
        })
        })
        .then( (response) => {
            if(response.status === 201) {
                console.log("Editado correctamente")
                this.setState({estado:3})
                this.setState({estadosucursal:3})
            } else {
                console.log('Hubo un error')
                this.setState({estado:2})
                this.setState({estadosucursal:2})
            }
        })
        .catch((error) => {
            console.log(error)
        });
      }else{
        this.setState({mensaje: 6})
      }
    }else{
      this.setState({mensaje: 5})
    }
  }

  EliminarProducto(oldData) {
    console.log(oldData._id)
    fetch('/delete_producto/' + oldData._id, {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: oldData._id,
    })
    })
    .then( (response) => {
        if(response.status === 201) {
            console.log("Eliminado correctamente")
            this.setState({estado:4})
            this.setState({estadosucursal:4})
        } else {
            console.log('Hubo un error')
            this.setState({estado:4})
            this.setState({estadosucursal:4})
        }
    })
    .catch((error) => {
        console.log(error)
    });
  }

  onChange(date, dateString) {
    this.setState({desde: dateString});
    console.log(dateString)
  }
  onChange2(date, dateString) {
    this.setState({hasta: dateString});
    console.log(dateString)
  }

  render(){
    let mensajito;

    if(this.state.estado === 1) {
      mensajito = <Alert severity="success">Producto agregado correctamente</Alert>
    }else if(this.state.estado === 2) {
      mensajito = <Alert severity="error">Lo sentimos, hubo un error, vuelva a intentarlo nuevamente</Alert>
    }else if(this.state.estado === 3) {
      mensajito = <Alert severity="success">El Producto se editó correctamente</Alert>
    }else if(this.state.estado === 4) {
      mensajito = <Alert severity="success">El Producto se eliminó correctamente</Alert>
    }else if(this.state.mensaje === 5){
      mensajito = <Alert severity="error">No se permiten números ni tildes en los campos tipo, material ni piedra.</Alert>
    }else if(this.state.mensaje === 6){
      mensajito = <Alert severity="error">No se permite ingresar números decimales.</Alert>
    }

    if(this.state.ready === true) {
      let nombresucursal;
        if(this.state.perfil.sucursal === '0') { nombresucursal = 'Lo Castillo'}
        if(this.state.perfil.sucursal === '1') { nombresucursal = 'Apumanque'}
        if(this.state.perfil.sucursal === '2') { nombresucursal = 'Vitacura'}
      if(this.state.periodo === false){
        if(this.state.perfil.gestion_inventario === true){
          return (
            <div style={styles.root}>
                <Card>
                <AppBar position="static" color="primary" style={styles.Barrita}>
                  <Tabs value={this.state.tabIndex} onChange={this.handleChange} aria-label="simple tabs example">
                    <Tab label="Inventario" {...a11yProps(0)} />
                    <Tab label="Inventario por periodo" {...a11yProps(1)} />
                  </Tabs>
                </AppBar>
                  <TabPanel value={this.state.tabIndex} index={0}>

                  <CardBody>
                  <MaterialTable
                      title= {nombresucursal}
                      options={{filtering: true}}
                      columns={ [{title: 'Fecha', field: 'fecha', type: 'date', editable: 'never'},
                                { title: 'Codigo', field: 'codigo' , type:'numeric' },
                                { title: 'Material', field: 'material' },
                                { title: 'Tipo de Joya', field: 'tipo' },
                                { title: 'Piedra', field: 'piedra' },
                                { title: 'Precio', field: 'precio' ,type: 'numeric'},
                                { title: 'Descripcion', field: 'descripcion' }]}
                      data={this.state.ListaProductos.filter(({sucursal}) => sucursal === this.state.perfil.sucursal)}
                      editable={{
                        onRowAdd: newData =>
                          new Promise((resolve, reject) => {
                            setTimeout(() => {
                              resolve();
                              this.ActualizarInventario();
                            }, 2000)
                            this.AgregarProducto(newData);
                          }),
                        onRowUpdate: (newData, oldData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              resolve();
                              this.ActualizarInventario();
                            }, 2000)
                            this.EditarProducto(newData)
                          }),
                        onRowDelete: (oldData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              resolve();
                              this.ActualizarInventario();
                            }, 2000)
                            this.EliminarProducto(oldData)
                          }),
                      }}
                    />
                    <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    spacing={3}>
                      <Grid item xs={6} text-align= "center">
                      <Box mt={1}>
                        {mensajito}
                        <Copyright />
                      </Box>
                      </Grid>
                    </Grid>
                  </CardBody>
                  </TabPanel>
                  <TabPanel value={this.state.tabIndex} index={1}>
                    <h4>Desde</h4>
                    <DatePicker onChange={this.onChange} format={"YYYY-MM-DD"} />
                    <h4>Hasta</h4>
                    <DatePicker onChange={this.onChange2} format={"YYYY-MM-DD"} />
                    <Button style={{margin: 5 }} onClick={this.ActualizarInventarioPeriodo}>
                      Listo
                    </Button>
                  </TabPanel>
                </Card>
            </div>
          )
        }else{
          return (
            <div style={styles.root}>
                <Card>
                <AppBar position="static" color="primary" style={styles.Barrita}>
                  <Tabs value={this.state.tabIndex} onChange={this.handleChange} aria-label="simple tabs example">
                    <Tab label="Inventario" {...a11yProps(0)} />
                    <Tab label="Inventario por periodo" {...a11yProps(1)} />
                  </Tabs>
                </AppBar>
                <TabPanel value={this.state.tabIndex} index={0}>
                  <CardBody>
                  <MaterialTable
                      title= {nombresucursal}
                      options={{filtering: true}}
                      columns={ [{title: 'Fecha', field: 'fecha', type: 'date', editable: 'never'},
                                { title: 'Codigo', field: 'codigo' , type:'numeric' },
                                { title: 'Material', field: 'material' },
                                { title: 'Tipo de Joya', field: 'tipo' },
                                { title: 'Piedra', field: 'piedra' },
                                { title: 'Precio', field: 'precio' ,type: 'numeric'},
                                { title: 'Descripcion', field: 'descripcion' }]}
                      data={this.state.ListaProductos.filter(({sucursal}) => sucursal === this.state.perfil.sucursal)}
                      editable={{ }}
                    />
                    <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    spacing={3}>
                      <Grid item xs={6} text-align= "center">
                      <Box mt={1}>
                        <Copyright />
                      </Box>
                      </Grid>
                    </Grid>
                  </CardBody>
                  </TabPanel>
                  <TabPanel value={this.state.tabIndex} index={1}>
                    <h4>Desde</h4>
                    <DatePicker onChange={this.onChange} format={"YYYY-MM-DD"} />
                    <h4>Hasta</h4>
                    <DatePicker onChange={this.onChange2} format={"YYYY-MM-DD"} />
                    <Button style={{margin: 5 }} onClick={this.ActualizarInventarioPeriodo}>
                      Listo
                    </Button>
                  </TabPanel>
                </Card>

            </div>
          )
        }
      }else{
        if(this.state.perfil.gestion_inventario === true){
          return (
            <div style={styles.root}>
                <Card>
                <AppBar position="static" color="primary" style={styles.Barrita}>
                  <Tabs value={this.state.tabIndex} onChange={this.handleChange} aria-label="simple tabs example">
                    <Tab label="Inventario" {...a11yProps(0)} />
                    <Tab label="Inventario por periodo" {...a11yProps(1)} />
                  </Tabs>
                </AppBar>
                  <TabPanel value={this.state.tabIndex} index={0}>

                  <CardBody>
                  <MaterialTable
                      title= {nombresucursal}
                      options={{filtering: true}}
                      columns={ [{title: 'Fecha', field: 'fecha', type: 'date', editable: 'never'},
                                { title: 'Codigo', field: 'codigo' , type:'numeric' },
                                { title: 'Material', field: 'material' },
                                { title: 'Tipo de Joya', field: 'tipo' },
                                { title: 'Piedra', field: 'piedra' },
                                { title: 'Precio', field: 'precio' ,type: 'numeric'},
                                { title: 'Descripcion', field: 'descripcion' }]}
                      data={this.state.ListaProductos.filter(({sucursal}) => sucursal === this.state.perfil.sucursal)}
                      editable={{
                        onRowAdd: newData =>
                          new Promise((resolve, reject) => {
                            setTimeout(() => {
                              resolve();
                              this.ActualizarInventario();
                            }, 2000)
                            this.AgregarProducto(newData);
                          }),
                        onRowUpdate: (newData, oldData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              resolve();
                              this.ActualizarInventario();
                            }, 2000)
                            this.EditarProducto(newData)
                          }),
                        onRowDelete: (oldData) =>
                          new Promise((resolve) => {
                            setTimeout(() => {
                              resolve();
                              this.ActualizarInventario();
                            }, 2000)
                            this.EliminarProducto(oldData)
                          }),
                      }}
                    />
                    <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    spacing={3}>
                      <Grid item xs={6} text-align= "center">
                      <Box mt={1}>
                        {mensajito}
                        <Copyright />
                      </Box>
                      </Grid>
                    </Grid>
                  </CardBody>
                  </TabPanel>
                  <TabPanel value={this.state.tabIndex} index={1}>
                    <h4>Desde</h4>
                    <DatePicker onChange={this.onChange} format={"YYYY-MM-DD"} />
                    <h4>Hasta</h4>
                    <DatePicker onChange={this.onChange2} format={"YYYY-MM-DD"} />
                    <Button style={{margin: 5 }} onClick={this.ActualizarInventarioPeriodo}>
                      Listo
                    </Button>
                    <CardBody>
                    <MaterialTable
                        title= {nombresucursal}
                        options={{filtering: true}}
                        columns={ [{title: 'Fecha', field: 'fecha', type: 'date', editable: 'never'},
                                  { title: 'Codigo', field: 'codigo' , type:'numeric' },
                                  { title: 'Material', field: 'material' },
                                  { title: 'Tipo de Joya', field: 'tipo' },
                                  { title: 'Piedra', field: 'piedra' },
                                  { title: 'Precio', field: 'precio' ,type: 'numeric'},
                                  { title: 'Descripcion', field: 'descripcion' }]}
                        data={this.state.ListaProductosPeriodo.filter(({sucursal}) => sucursal === this.state.perfil.sucursal)}
                        editable={{
                          onRowAdd: newData =>
                            new Promise((resolve, reject) => {
                              setTimeout(() => {
                                resolve();
                                this.ActualizarInventarioPeriodo();
                              }, 2000)
                              this.AgregarProducto(newData);
                            }),
                          onRowUpdate: (newData, oldData) =>
                            new Promise((resolve) => {
                              setTimeout(() => {
                                resolve();
                                this.ActualizarInventarioPeriodo();
                              }, 2000)
                              this.EditarProducto(newData)
                            }),
                          onRowDelete: (oldData) =>
                            new Promise((resolve) => {
                              setTimeout(() => {
                                resolve();
                                this.ActualizarInventarioPeriodo();
                              }, 2000)
                              this.EliminarProducto(oldData)
                            }),
                        }}
                      />
                      <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="flex-start"
                      spacing={3}>
                        <Grid item xs={6} text-align= "center">
                        <Box mt={1}>
                          {mensajito}
                          <Copyright />
                        </Box>
                        </Grid>
                      </Grid>
                    </CardBody>
                  </TabPanel>
                </Card>
            </div>
          )
        }else{
          return (
            <div style={styles.root}>
                <Card>
                <AppBar position="static" color="primary" style={styles.Barrita}>
                  <Tabs value={this.state.tabIndex} onChange={this.handleChange} aria-label="simple tabs example">
                    <Tab label="Inventario" {...a11yProps(0)} />
                    <Tab label="Inventario por periodo" {...a11yProps(1)} />
                  </Tabs>
                </AppBar>
                <TabPanel value={this.state.tabIndex} index={0}>
                  <CardBody>
                  <MaterialTable
                      title= {nombresucursal}
                      options={{filtering: true}}
                      columns={ [{title: 'Fecha', field: 'fecha', type: 'date', editable: 'never'},
                                { title: 'Codigo', field: 'codigo' , type:'numeric' },
                                { title: 'Material', field: 'material' },
                                { title: 'Tipo de Joya', field: 'tipo' },
                                { title: 'Piedra', field: 'piedra' },
                                { title: 'Precio', field: 'precio' ,type: 'numeric'},
                                { title: 'Descripcion', field: 'descripcion' }]}
                      data={this.state.ListaProductos.filter(({sucursal}) => sucursal === this.state.perfil.sucursal)}
                      editable={{ }}
                    />
                    <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="flex-start"
                    spacing={3}>
                      <Grid item xs={6} text-align= "center">
                      <Box mt={1}>
                        <Copyright />
                      </Box>
                      </Grid>
                    </Grid>
                  </CardBody>
                  </TabPanel>

                  <TabPanel value={this.state.tabIndex} index={1}>
                    <h4>Desde</h4>
                    <DatePicker onChange={this.onChange} format={"YYYY-MM-DD"} />
                    <h4>Hasta</h4>
                    <DatePicker onChange={this.onChange2} format={"YYYY-MM-DD"} />
                    <Button style={{margin: 5 }} onClick={this.ActualizarInventarioPeriodo}>
                      Listo
                    </Button>
                    <CardBody>
                    <MaterialTable
                        title= {nombresucursal}
                        options={{filtering: true}}
                        columns={ [{title: 'Fecha', field: 'fecha', type: 'date', editable: 'never'},
                                  { title: 'Codigo', field: 'codigo' , type:'numeric' },
                                  { title: 'Material', field: 'material' },
                                  { title: 'Tipo de Joya', field: 'tipo' },
                                  { title: 'Piedra', field: 'piedra' },
                                  { title: 'Precio', field: 'precio' ,type: 'numeric'},
                                  { title: 'Descripcion', field: 'descripcion' }]}
                        data={this.state.ListaProductosPeriodo.filter(({sucursal}) => sucursal === this.state.perfil.sucursal)}
                        editable={{ }}
                      />
                      <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="flex-start"
                      spacing={3}>
                        <Grid item xs={6} text-align= "center">
                        <Box mt={1}>
                          <Copyright />
                        </Box>
                        </Grid>
                      </Grid>
                    </CardBody>
                  </TabPanel>
                </Card>

            </div>
          )
        }
      }

    } else if(this.state.ready === false) {
      return(
        <div style={styles.root}>
        <Card>
          <CardBody>
            <p> Espera por favor.</p>
          </CardBody>
        </Card>
        </div>
      )
    }
  }
}
