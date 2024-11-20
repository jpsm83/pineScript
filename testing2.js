let maintenanceLetter;

switch (maintenanceType) {
    case "Preventivo":
        maintenanceLetter = "P";
        break;
    case "Correctivo":
        maintenanceLetter = "C";
        break;
    case "Otros":
        maintenanceLetter = "O";
        break;
    default:
        maintenanceLetter = "";
        break;
};

// Las OTs de mantenimiento están en la tabla ASPROP04.
let mantenimiento = "SELECT * FROM ASPROP04";

// Las correspondientes a Textil Olius : EMCODI=03. Abiertas: MP_SITUAC='A'.
let tosaMantenimientosAbiertos = "SELECT * FROM ASPROP04 WHERE EMCODI = '03' AND MP_SITUAC='A' ORDER BY MP_FPREVI DESC";

// Por el código de máquina MA_CODIGO, en la tabla, ASPROP02, obtendremos el recurso RETCOD.
let recursoDelMantenimeinto = "SELECT ASPROP04.MP_NUMERO, ASPROP04.OP_CODIGO, ASPROP04.MP_FPREVI, ASPROP02.MA_DESCRI, ASPROP04.MP_NOTAS, ASPROP01.OP_CLASE, ASPROP01.OP_DESCRI FROM ASPROP04 JOIN ASPROP02 ON ASPROP04.MA_CODIGO = ASPROP02.MA_CODIGO AND ASPROP04.EMCODI = ASPROP02.EMCODI JOIN ASPROP01 ON ASPROP04.OP_CODIGO = ASPROP01.OP_CODIGO WHERE ASPROP04.EMCODI = '03' AND ASPROP04.MP_SITUAC = 'A'";

if (maintenanceLetter) {
    recursoDelMantenimeinto += " AND ASPROP01.OP_CLASE = '" + maintenanceLetter + "'";
}

recursoDelMantenimeinto += " ORDER BY ASPROP02.MA_DESCRI ASC";
result = Things["CIP.Database.ERP"].Query({
	query: recursoDelMantenimeinto /* STRING */
});