import pandas as pd
import plotly.graph_objects as go
import glob
import os
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


# หาไฟล์ CSV ในโฟลเดอร์ data
csv_files = glob.glob("data/*.csv")

for file in csv_files:
    tf_name = os.path.basename(file).split('.')[0]
    print(f"กำลังสร้างกราฟสำหรับ: {tf_name}...")
    
    # อ่านไฟล์
    df = pd.read_csv(file)
    
    # ดึงข้อมูลมาแค่ 5000 แท่งล่าสุด เพื่อป้องกันไฟล์ HTML ใหญ่และกระตุกเกินไป (โดยเฉพาะ 1m)
    df_plot = df.tail(5000)
    
    fig = go.Figure(data=[go.Candlestick(x=df_plot['time'],
                open=df_plot['open'],
                high=df_plot['high'],
                low=df_plot['low'],
                close=df_plot['close'])])
    
    fig.update_layout(
        title=f"กราฟ {tf_name} (5,000 แท่งล่าสุด)",
        yaxis_title="Price",
        xaxis_title="Time",
        template="plotly_dark",
        xaxis_rangeslider_visible=False,
        height=800
    )
    
    # บันทึกเป็น HTML
    output_html = f"data/chart_{tf_name}.html"
    fig.write_html(output_html)
    print(f" -> บันทึกเรียบร้อย: {output_html}")

print("เสร็จสิ้นการสร้างกราฟครบทุก Timeframe! ดับเบิลคลิกไฟล์ .html เปิดในเบราว์เซอร์ได้เลย")
