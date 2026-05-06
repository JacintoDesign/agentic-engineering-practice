process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../src/db/connection');
const { createSchema } = require('./schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Project Owner', 'owner@test.com');
});

describe('Project endpoints', () => {
  test('POST /projects creates a project', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ name: 'My Project', description: 'A test project', owner_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Project');
    expect(res.body.id).toBeDefined();
  });

  test('POST /projects returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /projects returns all projects', async () => {
    await request(app).post('/projects').send({ name: 'Alpha' });
    await request(app).post('/projects').send({ name: 'Beta' });
    const res = await request(app).get('/projects');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /projects/:id returns project with stats', async () => {
    const created = await request(app)
      .post('/projects')
      .send({ name: 'Stats Project' });
    const projectId = created.body.id;

    await request(app).post('/tasks').send({ title: 'Active task', project_id: projectId });
    await request(app).post('/tasks').send({ title: 'Another active', project_id: projectId });

    const res = await request(app).get(`/projects/${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Stats Project');
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.total).toBe(2);
    expect(res.body.stats.active).toBe(2);
  });

  test('GET /projects/:id returns 404 for unknown project', async () => {
    const res = await request(app).get('/projects/99999');
    expect(res.status).toBe(404);
  });

  test('tasks can be assigned to a project', async () => {
    const proj = await request(app).post('/projects').send({ name: 'Assignment Test' });
    const projectId = proj.body.id;

    await request(app).post('/tasks').send({ title: 'Task in project', project_id: projectId });
    await request(app).post('/tasks').send({ title: 'Unassigned task' });

    const res = await request(app).get(`/tasks?project_id=${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Task in project');
  });

  test('PUT /projects/:id updates a project', async () => {
    const created = await request(app)
      .post('/projects')
      .send({ name: 'Old Name' });
    const res = await request(app)
      .put(`/projects/${created.body.id}`)
      .send({ name: 'New Name', description: 'Updated desc' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.description).toBe('Updated desc');
  });

  test('DELETE /projects/:id removes a project', async () => {
    const created = await request(app).post('/projects').send({ name: 'Doomed Project' });
    const projectId = created.body.id;

    const res = await request(app)
      .delete(`/projects/${projectId}`)
      .set('x-api-key', 'dev-key');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    const check = await request(app).get(`/projects/${projectId}`);
    expect(check.status).toBe(404);
  });
});
