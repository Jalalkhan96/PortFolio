const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.butlogin-popup');
const iconClose = document.querySelector('.icon-close');
const formBoxRegister = document.querySelector('.form-box.Register');
const formBoxLogin = document.querySelector('.form-box.login');

registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
    formBoxLogin.style.transform = 'translateX(-400px)';
    formBoxRegister.style.transform = 'translateX(0)';
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
    formBoxLogin.style.transform = 'translateX(0)';
    formBoxRegister.style.transform = 'translateX(400px)';
});

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
    formBoxLogin.style.transform = 'translateX(-400px)';
    formBoxRegister.style.transform = 'translateX(400px)';
});
