/// <reference types="cypress" />

describe('认证流程测试', () => {
  beforeEach(() => {
    // 访问首页
    cy.visit('/');
    // 清除本地存储，确保用户未登录
    cy.clearLocalStorage();
  });

  it('应该允许用户注册', () => {
    // 随机生成邮箱，避免重复注册
    const email = `test${Math.floor(Math.random() * 10000)}@example.com`;
    const password = 'Password123!';
    const name = 'Test User';

    // 点击注册按钮
    cy.get('[data-testid=register-link]').click();

    // 验证URL包含注册路径
    cy.url().should('include', '/register');

    // 填写注册表单
    cy.get('[data-testid=name-input]').type(name);
    cy.get('[data-testid=email-input]').type(email);
    cy.get('[data-testid=password-input]').type(password);
    cy.get('[data-testid=confirm-password-input]').type(password);

    // 提交表单
    cy.get('[data-testid=register-button]').click();

    // 验证注册成功，跳转到登录页面
    cy.url().should('include', '/login');
    cy.get('[data-testid=success-message]').should('contain', '注册成功');
  });

  it('应该允许用户登录和登出', () => {
    // 使用预设的测试账号
    const email = 'test@example.com';
    const password = 'Password123!';

    // 点击登录按钮
    cy.get('[data-testid=login-link]').click();

    // 验证URL包含登录路径
    cy.url().should('include', '/login');

    // 填写登录表单
    cy.get('[data-testid=email-input]').type(email);
    cy.get('[data-testid=password-input]').type(password);

    // 提交表单
    cy.get('[data-testid=login-button]').click();

    // 验证登录成功，跳转到首页
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-testid=user-menu]').should('be.visible');

    // 点击用户菜单
    cy.get('[data-testid=user-menu]').click();

    // 点击登出按钮
    cy.get('[data-testid=logout-button]').click();

    // 验证登出成功，用户菜单不再可见
    cy.get('[data-testid=user-menu]').should('not.exist');
    cy.get('[data-testid=login-link]').should('be.visible');
  });

  it('应该显示登录失败的错误消息', () => {
    // 使用错误的凭据
    const email = 'wrong@example.com';
    const password = 'WrongPassword123!';

    // 点击登录按钮
    cy.get('[data-testid=login-link]').click();

    // 填写登录表单
    cy.get('[data-testid=email-input]').type(email);
    cy.get('[data-testid=password-input]').type(password);

    // 提交表单
    cy.get('[data-testid=login-button]').click();

    // 验证显示错误消息
    cy.get('[data-testid=error-message]').should('be.visible');
    cy.get('[data-testid=error-message]').should('contain', '无效的凭据');
  });

  it('应该保护需要认证的路由', () => {
    // 尝试直接访问需要认证的页面
    cy.visit('/profile');

    // 验证被重定向到登录页面
    cy.url().should('include', '/login');
    cy.get('[data-testid=auth-required-message]').should('contain', '请先登录');
  });

  it('应该允许用户访问个人资料页面', () => {
    // 使用预设的测试账号
    const email = 'test@example.com';
    const password = 'Password123!';

    // 登录
    cy.get('[data-testid=login-link]').click();
    cy.get('[data-testid=email-input]').type(email);
    cy.get('[data-testid=password-input]').type(password);
    cy.get('[data-testid=login-button]').click();

    // 点击用户菜单
    cy.get('[data-testid=user-menu]').click();

    // 点击个人资料链接
    cy.get('[data-testid=profile-link]').click();

    // 验证成功访问个人资料页面
    cy.url().should('include', '/profile');
    cy.get('[data-testid=profile-heading]').should('contain', '个人资料');
    cy.get('[data-testid=user-email]').should('contain', email);
  });
}); 