import { Children, cloneElement, useId } from "react";

/* ---------------------------------------------------------------
   FormField — label + one control + optional hint and error, wired
   together: htmlFor/id, aria-describedby, aria-invalid.

     <FormField label="Start date" hint="…" error={err}>
       <input type="date" className="ui-input" value={…} onChange={…} />
     </FormField>

   hideLabel keeps the label for screen readers only (for inline inputs
   whose purpose is clear from the placeholder and context).

   FieldGroup — fieldset + legend for a group of buttons or chips
   (segmented controls, interest chips, a stepper).

     <FieldGroup legend="Pace">…buttons…</FieldGroup>

   Styles: .ui-field, .ui-field__label, .ui-field__hint, .ui-field__error
   and .ui-input in ui.css.
------------------------------------------------------------------ */

export default function FormField({ label, hint, error, hideLabel = false, className = "", children }) {
  const autoId = useId();
  const child = Children.only(children);
  const fieldId = child.props.id || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [child.props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["ui-field", className].filter(Boolean).join(" ")}>
      <label className={hideLabel ? "ui-sr-only" : "ui-field__label"} htmlFor={fieldId}>
        {label}
      </label>
      {cloneElement(child, {
        id: fieldId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : child.props["aria-invalid"],
      })}
      {hint && (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="ui-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FieldGroup({ legend, hint, className = "", children }) {
  const hintId = useId();
  return (
    <fieldset className={["ui-field", className].filter(Boolean).join(" ")} aria-describedby={hint ? hintId : undefined}>
      <legend className="ui-field__label">{legend}</legend>
      {children}
      {hint && (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </fieldset>
  );
}
