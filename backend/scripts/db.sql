create table usuarios (
    id serial primary key,
    nombre varchar(25) not null,
    edad int not null,
    fecha_de_nacimiento int not null,

    cant_apostada_juego1 int not null default 0,
    cant_ganada_juego1 int not null default 0,
    cant_perdida_juego1 int not null default 0,
    cant_creada_juego1 int not null default 0,

    cant_apostada_juego2 int not null default 0,
    cant_ganada_juego2 int not null default 0,
    cant_perdida_juego2 int not null default 0,
    cant_creada_juego2 int not null default 0,

    cant_ganada_sorteo int not null default 0,
    cant_unidos_sorteo int not null default 0,
    cant_creados_sorteo int not null default 0,
    cant_gastada_creados_sorteo int not null default 0
);
create table sorteos (
    id_sorteo serial primary key,
    id_creador int not null references usuarios(id),
    cantidad_unidos int not null default 0,
    total_sorteado int not null default 0,
    fecha_creacion timestamp default CURRENT_TIMESTAMP,
    -- timesstamp sirve para guardar la fecha al momento de que se cree el sorteo
    id_ganador int references usuarios(id)
);
create table juego1 (
    id_sala_juego1 serial primary key,
    id_creador int references usuarios(id),
    cant_apostada int,
    cant_minas int,
    cant retirada int,
    cant_seleccionados int
)
create table juego2 (
    id_sala_juego2 serial primary key,
    id_creador int references usuarios(id),
    cant_apostada int,
    id_ganador references usuarios(id),
    segundo_jugador boolean
)