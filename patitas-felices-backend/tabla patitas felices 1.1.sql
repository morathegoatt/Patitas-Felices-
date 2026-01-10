-- Tablas de Entidades Fuertes y Jerarquía (Supertipo)
CREATE TABLE Dueño (
    id_dueño INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(15) UNIQUE,
    CONSTRAINT pk_dueño PRIMARY KEY (id_dueño)
);
[cite_start][cite: 306-312]

CREATE TABLE Empleado (
    id_empleado INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    salario DECIMAL(10, 2),
    fecha_contratacion DATE,
    CONSTRAINT pk_empleado PRIMARY KEY (id_empleado)
);
[cite_start][cite: 313-319]

CREATE TABLE Mascota (
    id_mascota INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50),
    raza VARCHAR(50),
    fecha_nacimiento DATE,
    sexo CHAR(1),
    id_dueño INT NOT NULL,
    CONSTRAINT pk_mascota PRIMARY KEY (id_mascota),
    CONSTRAINT fk_mascota_dueño FOREIGN KEY (id_dueño)
    REFERENCES Dueño (id_dueño)
    ON DELETE RESTRICT
);
[cite_start][cite: 320-332]

CREATE TABLE Historial_Clinico (
    id_historial INT NOT NULL,
    id_mascota INT NOT NULL,
    CONSTRAINT pk_historial PRIMARY KEY (id_historial),
    CONSTRAINT uq_historial_mascota UNIQUE (id_mascota),
    CONSTRAINT fk_historial_mascota FOREIGN KEY (id_mascota)
    REFERENCES Mascota (id_mascota)
    ON DELETE CASCADE
);
[cite_start][cite: 333-341]

CREATE TABLE Cita (
    id_cita INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo VARCHAR(255),
    id_mascota INT NOT NULL,
    CONSTRAINT pk_cita PRIMARY KEY (id_cita),
    CONSTRAINT fk_cita_mascota FOREIGN KEY (id_mascota)
    REFERENCES Mascota (id_mascota)
    ON DELETE CASCADE
);
[cite_start][cite: 342-352]

-- Tablas de Jerarquía (Subtipos)
CREATE TABLE Veterinario (
    id_empleado INT NOT NULL,
    cedula_profesional VARCHAR(20) NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    CONSTRAINT pk_veterinario PRIMARY KEY (id_empleado),
    CONSTRAINT fk_vet_empleado FOREIGN KEY (id_empleado)
    REFERENCES Empleado (id_empleado)
    ON DELETE CASCADE
);
[cite_start][cite: 354-362]

CREATE TABLE Asistente (
    id_empleado INT NOT NULL,
    nivel_experiencia VARCHAR(50),
    funcion_principal VARCHAR(100),
    CONSTRAINT pk_asistente PRIMARY KEY (id_empleado),
    CONSTRAINT fk_asis_empleado FOREIGN KEY (id_empleado)
    REFERENCES Empleado (id_empleado)
    ON DELETE CASCADE
);
[cite_start][cite: 363-371]

-- Tablas de Relaciones y Entidades Débiles
CREATE TABLE Consulta (
    id_consulta INT NOT NULL,
    diagnostico TEXT,
    notas TEXT,
    id_cita INT NOT NULL,
    id_veterinario INT NOT NULL,
    CONSTRAINT pk_consulta PRIMARY KEY (id_consulta),
    CONSTRAINT uq_consulta_cita UNIQUE (id_cita),
    CONSTRAINT fk_consulta_cita FOREIGN KEY (id_cita)
    REFERENCES Cita (id_cita)
    ON DELETE RESTRICT,
    CONSTRAINT fk_consulta_veterinario FOREIGN KEY (id_veterinario)
    REFERENCES Veterinario (id_empleado)
    ON DELETE RESTRICT
);
[cite_start][cite: 373-387]

CREATE TABLE Tratamiento (
    id_tratamiento INT NOT NULL,
    id_consulta INT NOT NULL,
    CONSTRAINT pk_tratamiento PRIMARY KEY (id_tratamiento),
    CONSTRAINT fk_tratamiento_consulta FOREIGN KEY (id_consulta)
    REFERENCES Consulta (id_consulta)
    ON DELETE CASCADE
);
[cite_start][cite: 388-395]

CREATE TABLE Medicamento_Recetado (
    id_tratamiento INT NOT NULL,
    num_linea INT NOT NULL,
    nombre_farmaco VARCHAR(100) NOT NULL,
    dosis VARCHAR(50),
    frecuencia VARCHAR(100),
    CONSTRAINT pk_medicamento PRIMARY KEY (id_tratamiento, num_linea),
    CONSTRAINT fk_med_tratamiento FOREIGN KEY (id_tratamiento)
    REFERENCES Tratamiento (id_tratamiento)
    ON DELETE CASCADE
);
[cite_start][cite: 396-406]