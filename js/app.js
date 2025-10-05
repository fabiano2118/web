// Estado global
let currentSection = 'alumnos';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupAllForms();
    loadAlumnos();
    setAllTodayDates();
}

// Navegación
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Remover active de todos
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    
    // Activar botón (con validación)
    const button = document.querySelector(`[data-section="${sectionName}"]`);
    if (button) {
        button.classList.add('active');
    }
    
    // Activar sección (con validación)
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }
    
    currentSection = sectionName;
    loadSectionData(sectionName);
}

function loadSectionData(section) {
    switch(section) {
        case 'alumnos': loadAlumnos(); break;
        case 'docentes': loadDocentes(); break;
        case 'directivos': loadDirectivos(); break;
        case 'administrativos': loadAdministrativos(); break;
        case 'vigilancia': loadVigilancia(); break;
        case 'reportes': loadReportes(); break;
    }
}

// Configurar todos los formularios
function setupAllForms() {
    document.getElementById('form-alumnos')?.addEventListener('submit', handleAlumnosSubmit);
    document.getElementById('form-docentes')?.addEventListener('submit', handleDocentesSubmit);
    document.getElementById('form-directivos')?.addEventListener('submit', handleDirectivosSubmit);
    document.getElementById('form-administrativos')?.addEventListener('submit', handleAdministrativosSubmit);
    document.getElementById('form-vigilancia')?.addEventListener('submit', handleVigilanciaSubmit);
}

// ========== ALUMNOS ==========
async function handleAlumnosSubmit(e) {
    e.preventDefault();
    const data = {
        alumno_id: parseInt(document.getElementById('alumno-id').value),
        fecha: document.getElementById('alumno-fecha').value,
        hora_entrada: document.getElementById('alumno-entrada').value || null,
        hora_salida: document.getElementById('alumno-salida').value || null,
        estado: document.getElementById('alumno-estado').value,
        observaciones: document.getElementById('alumno-obs').value || null,
    };
    
    try {
    await AlumnosAPI.create(data);
    showAlert('Asistencia registrada correctamente', 'success');
    e.target.reset();
    document.getElementById('alumno-fecha').value = new Date().toISOString().split('T')[0];
    await loadAlumnos(); // ← Añade await
    refreshReportsIfActive(); // ← Añade esta línea
} catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

async function loadAlumnos() {
    const tbody = document.getElementById('tbody-alumnos');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando...</td></tr>';
    
    try {
        const data = await AlumnosAPI.getAll();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.alumno_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora_entrada || '-'}</td>
                <td>${item.hora_salida || '-'}</td>
                <td>${item.estado}</td>
                <td>${item.observaciones || '-'}</td>
                <td>
                    <button class="btn-delete" onclick="deleteAlumno(${item.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

async function deleteAlumno(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await AlumnosAPI.delete(id);
        showAlert('Eliminado correctamente', 'success');
        await loadAlumnos();      // ← SOLO UNA LLAMADA
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// ========== DOCENTES ==========
async function handleDocentesSubmit(e) {
    e.preventDefault();
    const data = {
        docente_id: parseInt(document.getElementById('docente-id').value),
        fecha: document.getElementById('docente-fecha').value,
        hora_entrada: document.getElementById('docente-entrada').value || null,
        hora_salida: document.getElementById('docente-salida').value || null,
        estado: document.getElementById('docente-estado').value,
        observaciones: document.getElementById('docente-obs').value || null,
    };
    
    try {
        await DocentesAPI.create(data);
        showAlert('Asistencia registrada correctamente', 'success');
        e.target.reset();
        document.getElementById('docente-fecha').value = new Date().toISOString().split('T')[0];
        await loadDocentes();
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

async function loadDocentes() {
    const tbody = document.getElementById('tbody-docentes');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando...</td></tr>';
    
    try {
        const data = await DocentesAPI.getAll();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.docente_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora_entrada || '-'}</td>
                <td>${item.hora_salida || '-'}</td>
                <td>${item.estado}</td>
                <td>${item.observaciones || '-'}</td>
                <td>
                    <button class="btn-delete" onclick="deleteDocente(${item.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

async function deleteDocente(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await DocentesAPI.delete(id);
        showAlert('Eliminado correctamente', 'success');
        await loadDocentes();
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// ========== DIRECTIVOS ==========
async function handleDirectivosSubmit(e) {
    e.preventDefault();
    const data = {
        directivo_id: parseInt(document.getElementById('directivo-id').value),
        fecha: document.getElementById('directivo-fecha').value,
        hora_entrada: document.getElementById('directivo-entrada').value || null,
        hora_salida: document.getElementById('directivo-salida').value || null,
        estado: document.getElementById('directivo-estado').value,
        observaciones: document.getElementById('directivo-obs').value || null,
    };
    
    try {
        await DirectivosAPI.create(data);
        showAlert('Asistencia registrada correctamente', 'success');
        e.target.reset();
        document.getElementById('directivo-fecha').value = new Date().toISOString().split('T')[0];
        await loadDirectivos();
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

async function loadDirectivos() {
    const tbody = document.getElementById('tbody-directivos');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando...</td></tr>';
    
    try {
        const data = await DirectivosAPI.getAll();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.directivo_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora_entrada || '-'}</td>
                <td>${item.hora_salida || '-'}</td>
                <td>${item.estado}</td>
                <td>${item.observaciones || '-'}</td>
                <td>
                    <button class="btn-delete" onclick="deleteDirectivo(${item.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

async function deleteDirectivo(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await DirectivosAPI.delete(id);
        showAlert('Eliminado correctamente', 'success');
        await loadDirectivos();
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// ========== ADMINISTRATIVOS ==========
async function handleAdministrativosSubmit(e) {
    e.preventDefault();
    
    const adminId = document.getElementById('admin-id').value;
    
    // Validación
    if (!adminId) {
        showAlert('Debe ingresar el ID del administrativo', 'error');
        return;
    }
    
    const data = {
        administrativo_id: parseInt(adminId),
        fecha: document.getElementById('admin-fecha').value,
        hora_entrada: document.getElementById('admin-entrada').value || null,
        hora_salida: document.getElementById('admin-salida').value || null,
        estado: document.getElementById('admin-estado').value,
        observaciones: document.getElementById('admin-obs').value || null,
    };
    
    console.log('Enviando datos administrativos:', data); // Debug
    
    try {
        await AdministrativosAPI.create(data);
        showAlert('Asistencia registrada correctamente', 'success');
        e.target.reset();
        document.getElementById('admin-fecha').value = new Date().toISOString().split('T')[0];
        await loadAdministrativos();
        refreshReportsIfActive();
    } catch (error) {
        console.error('Error completo:', error); // Debug
        showAlert('Error: ' + error.message, 'error');
    }
}

async function loadAdministrativos() {
    const tbody = document.getElementById('tbody-administrativos');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando...</td></tr>';
    
    try {
        const data = await AdministrativosAPI.getAll();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.administrativo_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora_entrada || '-'}</td>
                <td>${item.hora_salida || '-'}</td>
                <td>${item.estado}</td>
                <td>${item.observaciones || '-'}</td>
                <td>
                    <button class="btn-delete" onclick="deleteAdministrativo(${item.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

async function deleteAdministrativo(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await AdministrativosAPI.delete(id);
        showAlert('Eliminado correctamente', 'success');
        await loadAdministrativos();
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// ========== VIGILANCIA ==========
async function handleVigilanciaSubmit(e) {
    e.preventDefault();
    
    const vigilanciaId = document.getElementById('vigilancia-id').value;
    
    // Validación
    if (!vigilanciaId) {
        showAlert('Debe ingresar el ID del personal de vigilancia', 'error');
        return;
    }
    
    const data = {
        vigilancia_id: parseInt(vigilanciaId),
        fecha: document.getElementById('vigilancia-fecha').value,
        hora_entrada: document.getElementById('vigilancia-entrada').value || null,
        hora_salida: document.getElementById('vigilancia-salida').value || null,
        estado: document.getElementById('vigilancia-estado').value,
        observaciones: document.getElementById('vigilancia-obs').value || null,
    };
    
    console.log('Enviando datos vigilancia:', data); // Debug
    
    try {
        await VigilanciaAPI.create(data);
        showAlert('Asistencia registrada correctamente', 'success');
        e.target.reset();
        document.getElementById('vigilancia-fecha').value = new Date().toISOString().split('T')[0];
        await loadVigilancia();
        refreshReportsIfActive();
    } catch (error) {
        console.error('Error completo:', error); // Debug
        showAlert('Error: ' + error.message, 'error');
    }
}

async function loadVigilancia() {
    const tbody = document.getElementById('tbody-vigilancia');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Cargando...</td></tr>';
    
    try {
        const data = await VigilanciaAPI.getAll();
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">No hay registros</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.vigilancia_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora_entrada || '-'}</td>
                <td>${item.hora_salida || '-'}</td>
                <td>${item.estado}</td>
                <td>${item.observaciones || '-'}</td>
                <td>
                    <button class="btn-delete" onclick="deleteVigilancia(${item.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

async function deleteVigilancia(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await VigilanciaAPI.delete(id);
        showAlert('Eliminado correctamente', 'success');
        await loadVigilancia();
        refreshReportsIfActive();
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
    }
}

// ========== REPORTES ==========
async function loadReportes() {
    try {
        const data = await ReportesAPI.getGeneral();
        document.getElementById('stat-alumnos').textContent = data.datos.alumnos;
        document.getElementById('stat-docentes').textContent = data.datos.docentes;
        document.getElementById('stat-directivos').textContent = data.datos.directivos;
        document.getElementById('stat-administrativos').textContent = data.datos.administrativos;
        document.getElementById('stat-vigilancia').textContent = data.datos.vigilancia;
        document.getElementById('stat-total').textContent = data.datos.total_general;
    } catch (error) {
        showAlert('Error al cargar reportes: ' + error.message, 'error');
    }
}

// ========== UTILIDADES ==========
function setAllTodayDates() {
    const today = new Date().toISOString().split('T')[0];
    ['alumno', 'docente', 'directivo', 'admin', 'vigilancia'].forEach(prefix => {
        const input = document.getElementById(`${prefix}-fecha`);
        if (input) input.value = today;
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

// Función auxiliar para actualizar reportes automáticamente
function refreshReportsIfActive() {  // ← FUERA de showAlert
    if (currentSection === 'reportes') {
        loadReportes();
    }
}
