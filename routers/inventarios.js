import { Router } from "express";
import dotenv from "dotenv";
import con from "../config/data.js"
import proxyInventario from "../middleware/proxyInventario.js";


const Inventario =Router();
dotenv.config();

Inventario.get('/', (req, res) => {
    con.query('select * from inventarios',(err, data) => {
        if (err) {console.error(err); return res.status(500).json({ mensaje: 'Error al mostrar la database' });}
        console.table(data);
        res.json(data);
    });
});

/**
 * 8.Se Realiza un EndPoint que permita insertar registros en la tabla de
inventarios, los parámetros de entrada son (id_producto,id_bodega,cantidad).

 */
// Inventario.post('/',proxyInventario, (req, res) => {    
//     con.query('SELECT * FROM inventarios WHERE id_producto = ? and id_bodega = ?',
//     [req.body.id_producto,req.body.id_bodega],
//     (err, rows) => {
//         if (err) {
//             console.error(err);
//             res.status(500).json({ mensaje: 'Error en la consulta a la base de datos' })
//         }
//             if(rows.length > 0) {
//                 con.query('UPDATE inventarios SET cantidad = cantidad + ? WHERE id_bodega = ? AND id_producto = ?',
//                 [req.body.cantidad, req.body.id_bodega, req.body.id_producto],
//                 (err) => {
//                     if (err) {console.error(err); return res.status(500).json({ mensaje: 'Error al actualizar el registro' });}
//                     res.json({ mensaje: 'Registro actualizado exitosamente' });
//                 });
//             }else{
//                 con.query('INSERT INTO inventarios(id_producto, id_bodega, cantidad) VALUES (?,?,?)',
//                 [req.body.id_producto, req.body.id_bodega, req.body.cantidad],
//                 (err) => {
//                     if (err) {console.error(err); return res.status(500).json({ mensaje: 'Error al ingresar el registro' });}
//                     res.json({ mensaje: 'Registro ingresado exitosamente'});
//                 });
//             }
//         }
//         )
//     });

Inventario.post('/',proxyInventario,(req, res)=>{
    let queryselect = `SELECT * FROM inventarios`;
    let existecampo = false;
    con.query(queryselect, (err,dataselect,fil)=>{
        if(err){
            console.log("error al insertar la data");
            res.send(err);
        }else{
            for(let obj of dataselect){
                console.log(obj.id_bodega === req.body.id_bodega && obj.id_producto === req.body.id_producto);
                if(obj.id_bodega === req.body.id_bodega && obj.id_producto === req.body.id_producto){
                    existecampo = true;
                    console.log(obj.id);
                        con.query(`UPDATE inventarios SET cantidad = ${obj.cantidad + req.body.cantidad} WHERE id= ${obj.id}`,(err,respuesta,fil)=>{
                            if(err){
                                console.log("Error al insertar la data");
                                res.send(respuesta);
                            }else{
                                res.send({"Status":"200", "Message":"Registro ya existente asi que se actualiza"})
                            }
                        });
                    break;
                }
            }
            
            if(!existecampo){
                let queryIns = `INSERT INTO inventarios(id_bodega,id_producto,cantidad) VALUES (?,?,?)`;
                let datos = Object.values(req.body);
                console.log(datos);
                con.query(queryIns, datos,(err,datainsert,fil)=>{
                    if(err){
                        if(err.errno === 1452){
                            console.log("llave no existente , la bodega no existe ");
                            res.send({"Message":"La bodega no existe intente con otro id", "SQLError":err});
                        }
                        console.log("error al insertar los datos", err);
                        res.send(err);
                    }else{
                        console.log("data insertada correctamente", datainsert);
                        res.send({
                            "Status":200,
                            "Message": "La data se ha insertado correctamente"
                        });
                    }
                });
            }
        }
    })
});



export default Inventario