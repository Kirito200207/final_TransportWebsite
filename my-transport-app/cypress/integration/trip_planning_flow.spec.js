/// <reference types="cypress" />

describe('行程规划流程测试', () => {
  beforeEach(() => {
    // 访问首页
    cy.visit('/');
    // 登录测试账号
    cy.window().then((win) => {
      win.localStorage.setItem('token', Cypress.env('TEST_USER_TOKEN'));
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    // 刷新页面以应用登录状态
    cy.reload();
  });

  it('应该显示行程规划表单', () => {
    // 点击行程规划链接
    cy.get('[data-testid=plan-trip-link]').click();

    // 验证URL包含行程规划路径
    cy.url().should('include', '/plan-trip');

    // 验证表单元素存在
    cy.get('[data-testid=origin-input]').should('be.visible');
    cy.get('[data-testid=destination-input]').should('be.visible');
    cy.get('[data-testid=date-input]').should('be.visible');
    cy.get('[data-testid=time-input]').should('be.visible');
    cy.get('[data-testid=search-button]').should('be.visible');
  });

  it('应该允许用户搜索行程', () => {
    // 点击行程规划链接
    cy.get('[data-testid=plan-trip-link]').click();

    // 填写行程规划表单
    cy.get('[data-testid=origin-input]').type('北京站');
    cy.get('[data-testid=destination-input]').type('上海站');
    
    // 选择日期和时间
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    cy.get('[data-testid=date-input]').type(formattedDate);
    cy.get('[data-testid=time-input]').type('12:00');

    // 提交表单
    cy.get('[data-testid=search-button]').click();

    // 验证显示搜索结果
    cy.get('[data-testid=search-results]').should('be.visible');
    cy.get('[data-testid=trip-card]').should('have.length.at.least', 1);
  });

  it('应该显示行程详情', () => {
    // 点击行程规划链接
    cy.get('[data-testid=plan-trip-link]').click();

    // 填写行程规划表单
    cy.get('[data-testid=origin-input]').type('北京站');
    cy.get('[data-testid=destination-input]').type('上海站');
    
    // 选择日期和时间
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    cy.get('[data-testid=date-input]').type(formattedDate);
    cy.get('[data-testid=time-input]').type('12:00');

    // 提交表单
    cy.get('[data-testid=search-button]').click();

    // 等待搜索结果加载
    cy.get('[data-testid=trip-card]').first().click();

    // 验证显示行程详情
    cy.get('[data-testid=trip-details]').should('be.visible');
    cy.get('[data-testid=route-name]').should('be.visible');
    cy.get('[data-testid=departure-time]').should('be.visible');
    cy.get('[data-testid=arrival-time]').should('be.visible');
    cy.get('[data-testid=price]').should('be.visible');
    cy.get('[data-testid=available-seats]').should('be.visible');
  });

  it('应该允许用户预订行程', () => {
    // 点击行程规划链接
    cy.get('[data-testid=plan-trip-link]').click();

    // 填写行程规划表单
    cy.get('[data-testid=origin-input]').type('北京站');
    cy.get('[data-testid=destination-input]').type('上海站');
    
    // 选择日期和时间
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    cy.get('[data-testid=date-input]').type(formattedDate);
    cy.get('[data-testid=time-input]').type('12:00');

    // 提交表单
    cy.get('[data-testid=search-button]').click();

    // 等待搜索结果加载
    cy.get('[data-testid=trip-card]').first().click();

    // 点击预订按钮
    cy.get('[data-testid=book-button]').click();

    // 填写预订表单
    cy.get('[data-testid=passenger-count-input]').clear().type('2');
    cy.get('[data-testid=confirm-booking-button]').click();

    // 验证预订成功
    cy.get('[data-testid=booking-success]').should('be.visible');
    cy.get('[data-testid=booking-reference]').should('be.visible');
  });

  it('应该允许用户查看预订历史', () => {
    // 点击用户菜单
    cy.get('[data-testid=user-menu]').click();

    // 点击我的预订链接
    cy.get('[data-testid=my-bookings-link]').click();

    // 验证URL包含预订历史路径
    cy.url().should('include', '/bookings');

    // 验证显示预订历史
    cy.get('[data-testid=bookings-list]').should('be.visible');
    cy.get('[data-testid=booking-item]').should('have.length.at.least', 1);
  });
}); 