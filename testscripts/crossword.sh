# 98x210



vpype \
  eval "cell=10;width=210;height=90" \
  eval "nCols=floor(width/cell);nRows=floor(height/cell)" \
  eval "hatches=[43,44,45,66,85,86,87, 106,127,128,129, 47, 48, 49, 68, 89, 110,131,132,133, 70,91,112 ]" \
  eval "counter=1" \
  rect 0mm 0mm %width*mm% %height*mm% \
  repeat %nCols% \
    line %_i*cell*mm% 0 %_i*cell*mm% %height*mm% \
  end \
  repeat %nRows% \
    line 0 %_i*cell*mm% %width*mm% %_i*cell*mm% \
  end \
  begin grid -o %cell*mm% %cell*mm% %nCols% %nRows% \
    eval "%hatch=_i in hatches%" \
    eval "%n=10 if hatch else 0%" \
    text -s 8 -p 2mm 3mm "%_i%" \
    eval "%if not(hatch): counter+=1 %" \
    repeat %n% \
      line 0 %_i*mm% %_i*mm% 0 \
      line %_i*mm% %cell*mm% %cell*mm% %_i*mm% \
    end \
  end \
  show

# text -s 8 -p 0.5mm 1.5mm "%counter if not(hatch) else ''%" \  