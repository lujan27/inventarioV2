let pkg = []

const checkMandatoryInputs = () => {
    $('form.form-registration input').on('change', (e) => {
        const tgt = e.target;
        let max, min, value;

        switch (tgt.type) {
            case 'text':
                max = tgt.maxLength || 50;
                min = tgt.minLength || 2;
                value = tgt.value.trim().length;
                break;

            case 'number':
                max = tgt.max || 10;
                min = tgt.min || 0;
                value = parseInt(tgt.value);
                break;
        
            default:
                return;
        }

        if (value >= min && value <= max)
            $(tgt).addClass('is-valid');
        else
            $(tgt).addClass('is-invalid');
    })
    
    $('form.form-registration select').on('change', (e) => {
        const tgt = e.target;

        if (tgt.value != '0')
            $(tgt).addClass('is-valid');
        else
            $(tgt).addClass('is-invalid');
    })
}

const sendForm = () => {
    let index = 0,
        lock = true;

    $('form.form-registration .mandatory').forEach(element => {
        if (element.hasClass('is-valid'))
            pkg[index][element.id] = element.value;
        else {
            $(element).addClass('is-invalid');
            return lock = false;
        }
    });
    
    $('form.form-registration .form-control:not(.mandatory)').forEach(element => {
        switch (element.tagName) {
            case 'INPUT':
                if (element.type == 'number')
                    pkg[index][element.id] = parseFloat(element.value);
                pkg[index][element.id] = element.value.trim();
                break;
        
            default:
                break;
        }
    });
}

$(document).ready(() => {
    checkMandatoryInputs();
})